## Japanese Tourism AI Agent Development Stages
### 1 - MVP
0. login page with authentication using passkeys
1. Chat interface with AI Agent
2. Connection to SQL database
3. Create `Trip`, `Squad`, and `User` entries in database as required.
4. Research database `Location`, partner APIs, and the web for user itinerary
5. Save `ItineraryItems` to `Trip` in database under users' `Squad`
6. Dashboard page with a horizontal daily schedule overview, weather reports, google maps with itinerary locations. Right banner with profiles of other users on the trip. Left banner with action items icon buttons like "Leave Review", "Add Location", "Update Trip", "Get Advice"
7. [GetYourGuide API](https://code.getyourguide.com/partner-api-spec/) integration for finding and booking workshops and experiences


### 2 - Social Virality
1. Google login to access users' calendar, maps locations, and send emails
2. "Add to Telegram` button to invite Ri-chan bot into a group chat. App backend will handle message responses
3. "Add to Discord" button to Ri-chan discord bot page to add to their discord server in a channel.
4. "Share Trip" button that popsup icons for Farcaster, Twitter, and Instagram with posts prepopulated with trip summary, a beautiful image of where they are going, and tagging @zucity_japan.
5. Send a message during dinner time asking what they liked the most from today, why, and if they would like to update their itinerary based on their feedback.

### 3 Advanced Features
1. Multi-language support - English, Mandarin, Cantonese, Japanese, and Arabic
2. Send users options for hotel and train bookings to match their itinerary. Display options as cards for them to select one and send a "Confirm {{bookingName}} {{bookingTimeAndDate}}" message before sending to the server to complete
3. 