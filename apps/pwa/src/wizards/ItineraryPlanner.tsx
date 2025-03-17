"use client"

import { useState } from "react"
import { FontAwesome, MaterialIcons } from "@expo/vector-icons"
import { cn } from "@/lib/utils"

const ItineraryPlanner = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option))
    } else {
      setSelectedOptions([...selectedOptions, option])
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex-1 flex items-center">
          <div className="rounded-full w-6 h-6 flex items-center justify-center bg-white border-2 border-rose-500">
            <FontAwesome name="check-square-o" size={24} color="black" />
          </div>
          <div className="h-1 flex-1 bg-rose-400"></div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="rounded-full w-6 h-6 flex items-center justify-center bg-white border-2 border-rose-500">
            <FontAwesome name="check-square-o"  className="w-4 h-4 text-rose-500" />
          </div>
          <div className="h-1 flex-1 bg-rose-400"></div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="rounded-full w-6 h-6 flex items-center justify-center bg-white border-2 border-rose-500">
          <FontAwesome name="check-square-o"  className="w-4 h-4 text-rose-500" />

          </div>
          <div className="h-1 flex-1 bg-rose-400"></div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="rounded-full w-6 h-6 flex items-center justify-center bg-rose-500"></div>
          <div className="h-1 flex-1 bg-gray-200"></div>
        </div>

        <div className="rounded-full w-6 h-6 flex items-center justify-center bg-white border-2 border-gray-200"></div>
      </div>

      {/* Section Titles */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">Your kind of trip</h3>
          <div className="h-40 flex items-center justify-center">
            <img
              src="/placeholder.svg?height=150&width=150"
              alt="Person with map and luggage"
              className="h-36 object-contain"
            />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">Go-go-go or take it slow?</h3>
          <div className="h-40 flex items-center justify-center">
            <img src="/placeholder.svg?height=150&width=150" alt="Person doing yoga" className="h-36 object-contain" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">Let's talk money!</h3>
          <div className="h-40 flex items-center justify-center">
            <img src="/placeholder.svg?height=150&width=150" alt="Person with money" className="h-36 object-contain" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">Your bucket list</h3>
          <div className="h-40 flex items-center justify-center">
            <img
              src="/placeholder.svg?height=150&width=150"
              alt="Person with checklist"
              className="h-36 object-contain"
            />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Food & diet</h3>
          <div className="h-40 flex items-center justify-center">
            <img src="/placeholder.svg?height=150&width=150" alt="Food items" className="h-36 object-contain" />
          </div>
        </div>
      </div>

      <div className="text-right mb-8">
        <span className="text-lg">
          Lets create that trip! <FontAwesome name="rocket" className="inline w-5 h-5" />
        </span>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-medium text-center mb-10">What bucket list items are you hoping to check off?</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => toggleOption("museums")}
            className={
              "flex items-center gap-2 py-3 px-4 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              + selectedOptions.includes("museums") ? "bg-pink-100" : "bg-white"
            }
          >
            <span className="text-xl">🏛️</span>
            <span>Museums & historical places</span>
          </button>

          <button
            onClick={() => toggleOption("casinos")}
            className={
              "flex items-center gap-2 py-3 px-4 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              + selectedOptions.includes("casinos") ? "bg-pink-100" : "bg-white"
            }
          >
            <span className="text-xl">🎰</span>
            <span>Casinos & resorts</span>
          </button>

          <button
            onClick={() => toggleOption("foods")}
            className={
              "flex items-center gap-2 py-3 px-4 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              + selectedOptions.includes("foods") ? "bg-pink-100" : "bg-white"
            }
          >
            <span className="text-xl">🍜</span>
            <span>Local foods</span>
          </button>

          <button
            onClick={() => toggleOption("hiking")}
            className={
              "flex items-center gap-2 py-3 px-4 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              + selectedOptions.includes("hiking") ? "bg-pink-100" : "bg-white"
            }
          >
            <span className="text-xl">🌲</span>
            <span>Hiking & nature</span>
          </button>

          <button
            onClick={() => toggleOption("bars")}
            className={
              "flex items-center gap-2 py-3 px-4 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              + selectedOptions.includes("bars") ? "bg-pink-100" : "bg-white"
            }
          >
            <span className="text-xl">🍷</span>
            <span>Bar hopping</span>
          </button>

          <button
            onClick={() => toggleOption("shopping")}
            className={
              "flex items-center gap-2 py-3 px-4 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              + selectedOptions.includes("shopping") ? "bg-pink-100" : "bg-white"
            }
          >
            <span className="text-xl">🛍️</span>
            <span>Shopping</span>
          </button>

          <button
            onClick={() => toggleOption("adventure")}
            className={
              "flex items-center gap-2 py-3 px-4 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              + selectedOptions.includes("adventure") ? "bg-pink-100" : "bg-white"
            }
          >
            <span className="text-xl">🏄</span>
            <span>Adventure and thrill</span>
          </button>

          <button
            onClick={() => toggleOption("tours")}
            className={
              "flex items-center gap-2 py-3 px-4 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              + selectedOptions.includes("tours") ? "bg-pink-100" : "bg-white"
            }
          >
            <span className="text-xl">📸</span>
            <span>Tours & sightseeing</span>
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center items-center gap-8 mt-16">
        <button className="bg-rose-500 text-white px-8 py-3 rounded-md font-medium hover:bg-rose-600 transition-colors">
          Continue
        </button>
        <button className="text-gray-700 font-medium hover:text-rose-500 transition-colors">Back</button>
      </div>
    </div>
  )
}


export default ItineraryPlanner;