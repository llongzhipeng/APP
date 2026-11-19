#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
android_dir="$project_dir/android"
build_dir="$project_dir/dist/android"
sdk_dir="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
tools_dir="$sdk_dir/build-tools/35.0.1"
android_jar="$sdk_dir/platforms/android-35/android.jar"

if [[ ! -f "$android_jar" || ! -x "$tools_dir/aapt2" ]]; then
    echo "Install Android SDK Platform 35 and Build-Tools 35.0.1, then set ANDROID_SDK_ROOT." >&2
    exit 1
fi

cd "$project_dir"
npm run build:h5
mkdir -p "$build_dir"/{assets/web,classes,dex}
# Stage only the built H5 application. App-Plus hybrid resources use a separate build.
rm -rf "$build_dir/assets/web"
mkdir -p "$build_dir/assets/web"
cp -R dist/build/h5/{index.html,assets,static} "$build_dir/assets/web/"

"$tools_dir/aapt2" compile --dir "$android_dir/res" -o "$build_dir/resources.zip"
"$tools_dir/aapt2" link -I "$android_jar" --manifest "$android_dir/AndroidManifest.xml" \
    -A "$build_dir/assets" -o "$build_dir/unsigned.apk" "$build_dir/resources.zip"
activity_source="$android_dir/src/cn/yiwei/tablettraining/TrainingActivity.java"
if command -v javac >/dev/null; then
    javac --release 8 -cp "$android_jar" -d "$build_dir/classes" "$activity_source"
elif [[ -n "${ANDROID_ECJ_JAR:-}" ]]; then
    java -jar "$ANDROID_ECJ_JAR" -source 8 -target 8 -cp "$android_jar" \
        -d "$build_dir/classes" "$activity_source"
else
    echo "Install a JDK or set ANDROID_ECJ_JAR to an Eclipse compiler JAR." >&2
    exit 1
fi
"$tools_dir/d8" --release --min-api 26 --lib "$android_jar" --output "$build_dir/dex" \
    "$build_dir/classes"/cn/yiwei/tablettraining/*.class
(cd "$build_dir/dex" && zip -q "$build_dir/unsigned.apk" classes.dex)
"$tools_dir/zipalign" -f 4 "$build_dir/unsigned.apk" "$build_dir/aligned.apk"

if [[ -n "${ANDROID_KEYSTORE:-}" ]]; then
    sign_args=(--ks "$ANDROID_KEYSTORE")
    if [[ -n "${ANDROID_KEY_ALIAS:-}" ]]; then sign_args+=(--ks-key-alias "$ANDROID_KEY_ALIAS"); fi
    if [[ -n "${ANDROID_KEYSTORE_PASSWORD:-}" ]]; then sign_args+=(--ks-pass env:ANDROID_KEYSTORE_PASSWORD); fi
else
    preview_keystore="$android_dir/.signing/tablet-preview.p12"
    mkdir -p "$(dirname "$preview_keystore")"
    if [[ ! -f "$preview_keystore" ]]; then
        keytool -genkeypair -keystore "$preview_keystore" -storepass android -alias tablet-preview \
          -dname "CN=Training Tablet Preview" -keyalg RSA -keysize 2048 -validity 3650
    fi
    sign_args=(--ks "$preview_keystore" --ks-key-alias tablet-preview --ks-pass pass:android)
fi
apk="$build_dir/yiwei-training-tablet.apk"
"$tools_dir/apksigner" sign "${sign_args[@]}" --out "$apk" "$build_dir/aligned.apk"
"$tools_dir/apksigner" verify --verbose "$apk"
echo "$apk"
