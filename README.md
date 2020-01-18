Hotel Chatbot

The project in this repository is built using Botframework V4 NodeJS SDK & showcases following functionalities & features:

    Book a hotel using guided inputs or in natural language.
    Talk general stuff like chitchat at any point in the conversation. I have used Microsoft QnAMaker for the same.
    Natural language understanding is done using Microsoft LUIS cognitive service or Azure.
    Project also has a tableau file (Hotel_Chatbot/HotelBot/Tableau/HotelBotTableau.twb) to see analytical charts regarding conversations done by the chatbot.
    Storage of data regarding conversation is done using Cosmos DB.
    Project files have been segregated in a way that they can be easily enhanced or reused to create any new bot or modify the existing bot.

Usage
Clone the project run npm install
Start with npm start
Using any emulator/channel access http://localhost:3978/api/messages and start chatting