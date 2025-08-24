import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionsRow = ({ onPromptClick }) => {
  const prompts = [
    "I forgot my password. How do I reset it?",
    "How do I get a refund?",
    "Why can't I send money using a balance?",
    "How do I enable or disable autopay for my active Pay Monthly plan?",
  ];
  
  return (
    <div className="prompt-suggestion-row">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={onPromptClick}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionsRow;
