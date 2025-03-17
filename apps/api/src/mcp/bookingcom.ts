import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import z from 'zod';

const endpoint = "https://demandapi.booking.com/3.1/"
// always returned as XML, use LLM to turn into JSON for use in richan
const defaultLanguages =  ['en-us', 'zh-cn', 'ja-jp', '']

const server = new McpServer({
    name: "Booking.com Accomodations Service",
    version: "0.0.1",   
  });

server.tool(
    "getHoodsInCity",
    "The city to get booking.com specific Hood IDs for different subsections of the city for users to select before hotel recommendations",
    {
        city: z.string().describe("The name of the city."),
    },
    async ({ city }) => {
        // TODO prefetch all cities/distrcits and cache them or add to Location.db info.
    
        const resp = await axios.post(
            `${endpoint}/common/locations/regions`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Affiliate-Id': apiKey,
                Authorization: 'Bearer <YOUR_string_HERE>'
              },
              data: JSON.stringify({
                country: 'jp',
                languages: defaultLanguages
              })
            }
          );
          
          // TODO filter through city/region to get districts that are a closest match
          const cityId = resp.data.regions[0].cities[0].id;
    
          const resp2 = await axios.post(
            `${endpoint}/common/locations/districts`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Affiliate-Id': apiKey,
                Authorization: 'Bearer <YOUR_string_HERE>'
              },
              data: JSON.stringify({
                city: cityId,
                languages: defaultLanguages
              })
            }
          );
          
          const data = await resp2.data;
          console.log(data);
          return data;
      })


server.tool("getAccomodationRecommendations",
    "The city to get hotel recomendations for",
    {
      city: z.string().describe("City ID from Booking.com that user wants hotels in during trip times"),
      neighborhoodId: z.string().describe("The neighborhood ID to get hotel recomendations for"),
      startTime: z.date().describe("The start date of the trip. Must be yyyy-mm-dd format."),
      endTime: z.date().describe("The end date of the trip. Muust be yyyy-mm-dd format,"), 
    },
    async ({ city, neighborhoodId, startTime, endTime }) => {
        console.log("mcp:booking:search: ", city, neighborhoodId, startTime, endTime); 

        /// search API https://developers.booking.com/demand/docs/open-api/demand-api/accommodations/accommodations/search
        const apiKey = process.env.WEATHER_API_KEY;
        const response = await axios.post(`${endpoint}/accommodations/search/`, {
            headers: { 'X-Affiliate-Id': apiKey },
            data: {
                city: city,
                booker: {
                    // TODO based on user request metadata
                    country: 'US',
                    platform: 'desktop',
                    travel_purpose: 'leisure',
                },
                checkin: startTime, // TODO yyyy-mm-dd format
                checkout: endTime, // TODO yyyy-mm-dd format
                currency: 'JPY',
                dormitory: 'exclude', // only hotels and private rooms
                guests: {
                    // TODO per adults + room info from trip/squad info
                    number_of_adults: 2,
                    number_of_rooms: 1,
                },
                rating: {
                    ​minimum_review_score: 7
                },
                district_id: neighborhoodId,
                
            }
        })
        console.log("mcp:booking:recommendations: ", response.data);
        return response.data;
        // return {
        //     content: [
        //         // { type: "json", json: response }, // TODO filter results or something first. Only show users 3 options, then give 3 more if they dont like them
        //         { type: "text", text: JSON.stringify(response.data) }
        //     ]
        // };
    });
    
    const apiKey = process.env.BOOKING_API_KEY;
    server.tool(
        "reserveHotel",
        "Complete a hotel, ryoukan, or vacation home reservation for a user using Booking.com API",
        {
            city: z.string().describe("The city to get weather for"),
            startTime: z.date().describe("The start date of the trip. Must be yyyy-mm-dd format."),
            endTime: z.date().describe("The end date of the trip. Muust be yyyy-mm-dd format,"), 
        },
        async ({ city, startTime, endTime }) => {
            console.log("mcp:booking:reserve: ", city, startTime, endTime); 
            const resp = await axios.post(
                `${endpoint}/orders/create`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Affiliate-Id': '0',
            Authorization: 'Bearer <YOUR_string_HERE>'
          },
          data: JSON.stringify({
            accommodation: {
              label: 'Sample label',
              products: [
                {
                  id: '333',
                  bed_configuration: '123456',
                  guests: [
                    {
                      email: 'test.name@booking.com',
                      name: 'Test Name'
                    }
                  ]
                }
              ],
              remarks: {
                estimated_arrival_time: {hour: 12},
                special_requests: 'We will need an extra cot.'
              }
            },
            booker: {
              address: {
                address_line: 'Road-1, house-2',
                city: 'Amsterdam',
                country: 'nl',
                post_code: '11111'
              },
              company: 'Booking B.V',
              email: 'test.name@booking.com',
              language: 'en-gb',
              name: {
                first_name: 'Test',
                last_name: 'Name'
              },
              telephone: '12345678'
            },
            order_token: 'sample-token',
            payment: {
              card: {
                cardholder: 'Test Name',
                cvc: '111',
                expiry_date: '2030-10',
                number: '23333333333333'
              },
              include_receipt: true,
              method: 'card',
              timing: 'pay_at_the_property'
            }
          })
        }
      );
      
      const data = await resp.data;
      console.log(data);
    return data
    // {
    //     content: [
    //         { type: "text", text: JSON.stringify(data) }

    //     ]
    // };
  }
);

export default server;
