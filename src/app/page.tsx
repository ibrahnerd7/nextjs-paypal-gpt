"use client";
import Image from "next/image";
import paypaLogo from "../assets/logo.png";
// @ts-ignore
import { useChat } from "@ai-sdk/react";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";
import { useState } from "react";

const Home = () => {
  const { messages, status, sendMessage, setMessages } = useChat();

  const [input, setInput] = useState("");

  const isLoading = status === 'submitted'
  const noMessages = !messages || messages.length === 0;

  const handlePrompt = (promptText) => {
    setInput(promptText);
  };

  const parseMarkDown = (text: string) => {
	const toHTML = text
		.replace(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
		.replace(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
		.replace(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
		.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold text
		.replace(/\*(.*)\*/gim, '<i>$1</i>'); // italic text
	return toHTML.trim(); // using trim method to remove whitespace
}

  return (
    <main>
      <Image
        src={paypaLogo}
        alt="Paypal Logo"
        style={{ width: "8%"}}
      />
      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <>
            <p className="starter-text">
              The ultimate place for Paypal questions! Ask PaypalGPT anything
              paypal and it will come back with the most up-to-date answers. We
              hope you enjoy!
            </p>
            <br />
            <PromptSuggestionsRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className="whitespace-pre-wrap">
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Bubble
                          key={`${message.id}-${i}`}
                          message={{ role: message.role, content: parseMarkDown(part.text) }}
                        ></Bubble>
                      );
                  }
                })}
              </div>
            ))}
            {isLoading && <LoadingBubble />}
          </>
        )}
      </section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({
            id: crypto.randomUUID(),
            text: input,
            role: "user",
          });
          setInput("");
        }}
      >
        <input
          className="question-box"
          onChange={(e) => setInput(e.currentTarget.value)}
          value={input}
          placeholder="Ask me something ..."
        />
        <input type="submit" />
      </form>
    </main>
  );
};

export default Home;
