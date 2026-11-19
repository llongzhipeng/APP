/**
 * English Language Pack
 */
export default {
  common: {
    start: 'Start Game',
    pause: 'Pause',
    continue: 'Continue',
    back: 'Back',
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    clear: 'Clear',
    score: 'Score',
    time: 'Time',
    difficulty: 'Difficulty',
    language: 'Language'
  },
  menu: {
    title: 'Math Match',
    subtitle: 'Cognitive Training Game',
    selectDuration: 'Select Training Duration',
    viewRules: 'Game Rules',
    viewRecords: 'History Records',
    startGame: 'Start Training'
  },
  game: {
    target: 'Target',
    currentScore: 'Current Score',
    timeLeft: 'Time Left',
    level: 'Difficulty Level',
    correct: 'Correct',
    wrong: 'Wrong',
    paused: 'Game Paused',
    resume: 'Click to Resume',
    levelUp: 'Level Up!',
    levelDown: 'Level Down',
    skip: 'Skip Game'
  },
  rules: {
    title: 'Game Rules',
    rule1: 'A target value will be displayed at the top of the screen',
    rule2: 'Find 2 cards that add up to the target value and click them',
    rule3: 'Score per correct answer = 5 × Current difficulty coefficient',
    rule4: 'Difficulty auto-adjusts every 30 seconds based on accuracy during that period',
    rule5: 'Accuracy >90% increases difficulty, <70% decreases it',
    rule6: 'Cards disappear when correct, new cards appear, target updates randomly',
    rule7: 'Difficulty levels 1-6, card count from 8 to 18, target range gradually increases'
  },
  result: {
    title: 'Training Complete',
    finalScore: 'Final Score',
    duration: 'Training Duration',
    totalAttempts: 'Total Attempts',
    successCount: 'Success Count',
    failCount: 'Fail Count',
    successRate: 'Success Rate',
    avgReactionTime: 'Avg Reaction Time',
    difficultyLevel: 'Difficulty Level',
    backToMenu: 'Back to Menu',
    viewDetails: 'View Details',
    millisecond: 'ms',
    second: 's',
    minute: 'min'
  },
  records: {
    title: 'History Records',
    noRecords: 'No training records yet',
    trainTime: 'Train Time',
    project: 'Training Project',
    duration: 'Duration',
    score: 'Score',
    successRate: 'Success Rate',
    clearAll: 'Clear All Records',
    confirmClear: 'Are you sure to clear all records?',
    projectName: 'Math Match'
  },
  tutorial: {
    title: 'Game Tutorial',
    previous: 'Previous',
    next: 'Next',
    startGame: 'Start Game',
    dontShowAgain: 'Don\'t show this tutorial again',
    accuracy: 'Accuracy',
    step1Title: 'Step 1: Know the Target',
    step1Desc: 'When the game starts, a target value will be displayed at the top - this is the number you need to match.',
    step1Tip: 'The target value updates randomly after each correct answer',
    step2Title: 'Step 2: Select Cards',
    step2Desc: 'Click on number cards in the card area to make their sum equal to the target value.',
    step2Tip: 'All difficulty levels require selecting 2 cards',
    step3Title: 'Step 3: Cards Disappear & Refresh',
    step3Desc: 'When correct, selected cards will disappear and new cards will be generated in empty spaces.',
    step3Tip: 'New cards will have a flashing animation',
    step4Title: 'Step 4: Smart Difficulty Adjustment',
    step4Desc: 'The game automatically adjusts difficulty every 30 seconds based on accuracy during that period.',
    step4Tip: 'Accuracy >90% increases difficulty, <70% decreases it, keeping the game challenging'
  }
};
