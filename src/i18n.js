const translations = {
  en: {
    app_title: "WikiGame",
    play_now: "Play Now",
    loading: "Loading...",
    enter_name: "Enter your name to start",
    submit: "Enter",
    welcome_back: "Welcome back,",
    change_name: "Change your name? Logout",
    active_round: "Active Round!",
    start_point: "Start Point",
    target_goal: "Target Goal",
    time_left: "Time Left",
    clicks: "Clicks",
    current_page: "Current Page",
    target: "Target",
    leaderboard: "Leaderboard",
    player: "Player",
    score: "Score",
    status: "Status",
    back: "Back",
    win_title: "🎉 well done!",
    win_desc: "You reached the target successfully! Check the leaderboard for your rank.",
    lost_title: "⏳ Time's up!",
    lost_desc: "The global round ended before you reached the target.",
    play_again: "Play New Round",
    no_scores: "No scores yet",
    thinking_phase: "Planning Phase",
    starts_in: "Round starts in",
    intro_text: "Navigate from a Wikipedia article to the target using only internal links. Compete against others in real-time for the fastest time and fewest clicks!",
  }
};

export const useTranslation = () => {
  const t = (key) => {
    return translations['en']?.[key] || key;
  };
  return { t };
};

export default translations;
