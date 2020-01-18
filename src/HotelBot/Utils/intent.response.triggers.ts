export default class {
    intent_msg = {
        WELCOME_TEXT: "Hi I’m the hotel chatbot, I can help you with booking a room inside the hotel.",
        CANNED_RESPONSE: "Sorry about the inconvenience you are currently facing. Please send the details of this issue to: xyz"
    }

    intent_map = {
        DISPATCHER: {
            CALL_HOTEL_BOOKING_LUIS: "luis_hotel_booking",
            CALL_CHITCHAT_QNA: "qna_professional_chitchat"
        },
        GREETING: "greeting",
        HOTELBOOKINGLUIS: {
            INTENTS: {
                BOOK_HOTEL: "book_hotel"
            }
        }
    }

    entity_map = {
        HOTELBOOKINGLUIS: {
            ENTITIES: {
                LOCATION: "location",
                NUM_OF_PEOPLE: "builtin.number",
                DATE: "builtin.datetimeV2.date"
            }
        }
    }

    locations = ["bengaluru","kolkata","pune","mumbai","gurugram","delhi","kochi","coimbatore"];

    num_of_people = ["one","1","two","2","three","3"];

    greeting_triggers = ["hi","hello","hey","help"];
}