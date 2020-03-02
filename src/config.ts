export default {
    host:process.env.HOST || "https://abc.azure.com:443/",
    authKey:process.env.AUTH_KEY || "<auth-key>",
    databaseId:"chatbot_db",
    collectionId:"hotel_bot_table",
    chitChatQnAURL: "<chitchat-qna-url>",
    chitChatQnAAuthorization: "EndpointKey <chitchat-qna-authorization-key>",
    chitChatQnAConfidence: 80,
    FeedbackLUISURL: "<feedback-luis-url>",
    FeedbackLUISConfidence: 90
}
