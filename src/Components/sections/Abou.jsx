import React from "react";
import styled from "styled-components";

const Section = styled.section`
  position: relative;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  margin: 0 auto;
  background-color: ${(props) => props.theme.body};

  @media (max-width: 48em) {
    width: 100vw;
  }
  @media (max-width: 30em) {
    width: 100vw;
  }
`;

const Title = styled.h1`
  font-size: ${(props) => props.theme.fontBig};
  font-family: "Kaushan Script";
  font-weight: 300;

  position: absolute;
  top: 1rem;
  left: 5%;
  z-index: 5;

  @media (max-width: 64em) {
    font-size: ${(props) => `calc(${props.theme.fontBig} - 5vw)`};
    top: 0;
    left: 0;
  }
  @media (max-width: 48em) {
    font-size: ${(props) => props.theme.fontxxxl};
  }
`;

const Left = styled.div`
  width: 50%;
  font-size: ${(props) => props.theme.fontlg};
  font-weight: 300;
  position: relative;
  z-index: 5;
  margin-top: 20%;
  margin-left: 20%; /* Shift content to the right by 20% of the container width */

  @media (max-width: 64em) {
    width: 80%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) !important;
    margin: 0 auto;

    padding: 2rem;
    font-weight: 600;

    backdrop-filter: blur(2px);
    background-color: ${(props) => `rgba(${props.theme.textRgba},0.4)`};
    border-radius: 20px;
  }

  @media (max-width: 48em) {
    font-size: ${(props) => props.theme.fontmd};
  }
  @media (max-width: 30em) {
    font-size: ${(props) => props.theme.fontsm};
    width: 70%;
  }
`;

const Abou = () => {
  return (
    <Section className="about">
      <Title>About Us</Title>
      <Left>
        VibeNet is a dynamic social networking platform where people connect, share, and engage with each other. Whether you’re looking to meet new friends, share your passions, or stay updated with what’s happening around the world, VibeNet is the place to be.
        <br />
        <br />
        Our mission is to create a space where individuals can express themselves freely, discover new communities, and connect over shared interests. With personalized profiles, instant messaging, and interactive features, VibeNet makes online connection seamless and fun.
        <br />
        <br />
        We’re constantly innovating to make socializing easier and more enjoyable. Join VibeNet today and be part of a vibrant community where you can create lasting connections.
      </Left>
    </Section>
  );
};

export default Abou;
