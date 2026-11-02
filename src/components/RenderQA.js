import React from "react";
import { Spin } from "antd";
import { AudioOutlined } from "@ant-design/icons"; //audio icon
import axios from "axios";
import { Buffer } from "buffer";

const DOMAIN = "http://localhost:5001";

const containerStyle = {
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "column",
  marginBottom: "20px",
};

const userContainer = {
  textAlign: "right",
};

const agentContainer = {
  textAlign: "left",
};

const userStyle = {
  maxWidth: "50%",
  textAlign: "left",
  backgroundColor: "#ed7308",
  color: "white",
  display: "inline-block",
  borderRadius: "10px",
  padding: "10px",
  marginBottom: "10px",
};

const agentStyle = {
  maxWidth: "50%",
  textAlign: "left",
  backgroundColor: "#fdd656",
  color: "black",
  display: "inline-block",
  borderRadius: "10px",
  padding: "10px",
  marginBottom: "10px",
  position: "relative",
};

const audioIconStyle = {
  position: "absolute",
  top: "50%",
  right: "-25px",
  transform: "translateY(-50%)",
  cursor: "pointer",
};

const RenderQA = (props) => {
  const { conversation } = props;

  const handleTextToSpeech = async (words) => {
    try {
      const response = await axios.get(`${DOMAIN}/tts?words=${words}`);
      const decodedAudioData = Buffer.from(
        response?.data?.audio_data,
        "base64",
      );

      // Create a Blob with the correct MIME type
      const audioBlob = new Blob([decodedAudioData], { type: "audio/mp3" });
      // Create an object URL from the Blob
      const audioUrl = URL.createObjectURL(audioBlob);
      //Play the audio
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error with TTS API:", error);
    }
  };

  return (
    <>
      {conversation?.map((each, index) => (
        <div key={index} style={containerStyle}>
          <div style={userContainer}>
            <div style={userStyle}>{each.question}</div>
          </div>
          <div style={agentContainer}>
            <div style={agentStyle}>
              {each.answer === null ? (
                <Spin size="small" />
              ) : (
                <>
                  {each.answer}
                  <AudioOutlined
                    style={audioIconStyle}
                    onClick={() => handleTextToSpeech(each.answer)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default RenderQA;
