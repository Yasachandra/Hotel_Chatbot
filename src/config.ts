export default {
    host:process.env.HOST || "https://sfb-cosmos-db.documents.azure.com:443/",
    authKey:process.env.AUTH_KEY || "weainSpvRM66osExcAwfUH68rOq3yjgSdb0nDAKHHdRGx3rRFy7QYv3oiscx67F9C0hQ8zPLUU5pQGi8dI4srw==",
    databaseId:"chatbot_db",
    collectionId:"hotel_bot_table",
    chitChatQnAURL: "https://procurement-bot-qna.azurewebsites.net/qnamaker/knowledgebases/a6757cab-dc8b-419e-8bc6-366ecb6cbf52/generateAnswer",
    chitChatQnAAuthorization: "EndpointKey aeecb31e-5b3e-4266-bd57-17b1ceb0d992",
    chitChatQnAConfidence: 80,
    FeedbackLUISURL: "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a6eb6234-fb8c-4206-a22e-503bc095fcb1?verbose=true&timezoneOffset=0&subscription-key=48a159a967d84dc58258e3025a7936da&q=",
    FeedbackLUISConfidence: 90
}