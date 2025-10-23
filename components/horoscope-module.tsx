"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { elevenLabsService } from "@/lib/elevenlabs"
import { Star, Volume2, Moon, Gem } from "lucide-react"

const zodiacSigns = [
  { value: "aries", label: "♈ Aries", dates: "Mar 21 - Apr 19" },
  { value: "taurus", label: "♉ Taurus", dates: "Apr 20 - May 20" },
  { value: "gemini", label: "♊ Gemini", dates: "May 21 - Jun 20" },
  { value: "cancer", label: "♋ Cancer", dates: "Jun 21 - Jul 22" },
  { value: "leo", label: "♌ Leo", dates: "Jul 23 - Aug 22" },
  { value: "virgo", label: "♍ Virgo", dates: "Aug 23 - Sep 22" },
  { value: "libra", label: "♎ Libra", dates: "Sep 23 - Oct 22" },
  { value: "scorpio", label: "♏ Scorpio", dates: "Oct 23 - Nov 21" },
  { value: "sagittarius", label: "♐ Sagittarius", dates: "Nov 22 - Dec 21" },
  { value: "capricorn", label: "♑ Capricorn", dates: "Dec 22 - Jan 19" },
  { value: "aquarius", label: "♒ Aquarius", dates: "Jan 20 - Feb 18" },
  { value: "pisces", label: "♓ Pisces", dates: "Feb 19 - Mar 20" },
]

const mockHoroscopes: { [key: string]: string } = {
  aries:
    "Today brings dynamic energy! Focus on new beginnings and take bold steps toward your goals. Your natural leadership will shine.",
  taurus:
    "Stability is key today. Ground yourself and appreciate the beauty around you. Financial opportunities may present themselves.",
  gemini:
    "Communication flows easily today. Express your ideas and connect with others. Your curiosity will lead to new discoveries.",
  cancer:
    "Nurture your inner self today. Family and home life bring comfort. Trust your intuition in important decisions.",
  leo: "Shine brightly today! Your creativity and leadership are at their peak. Others will be drawn to your magnetic energy.",
  virgo:
    "Pay attention to details today. Organize your tasks for maximum efficiency. Your practical approach will yield great results.",
  libra: "Seek balance and harmony today. Partnerships thrive under your diplomatic touch. Beauty and art inspire you.",
  scorpio:
    "Embrace transformation today. Dive deep into your passions. Your intensity will help you overcome any obstacles.",
  sagittarius: "Adventure calls today! Explore new philosophies and expand your horizons. Your optimism is contagious.",
  capricorn:
    "Discipline brings rewards today. Focus on your long-term ambitions. Your persistence will pay off handsomely.",
  aquarius:
    "Innovate and inspire today. Your unique vision can change the world. Embrace your individuality and humanitarian spirit.",
  pisces:
    "Trust your intuition today. Dreams and creative pursuits are favored. Your compassion will touch many hearts.",
}

const luckyElements = {
  colors: [
    "Gold",
    "Silver",
    "Blue",
    "Green",
    "Red",
    "Purple",
    "Orange",
    "Pink",
    "Yellow",
    "White",
    "Black",
    "Turquoise",
  ],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33],
  stones: [
    "Diamond",
    "Ruby",
    "Emerald",
    "Sapphire",
    "Amethyst",
    "Topaz",
    "Garnet",
    "Pearl",
    "Opal",
    "Aquamarine",
    "Citrine",
    "Moonstone",
  ],
}

const moonPhases = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
]

export default function HoroscopeModule({ onHoroscopeSpeak }: { onHoroscopeSpeak?: (text: string) => void }) {
  const [selectedSign, setSelectedSign] = useState("")
  const [horoscope, setHoroscope] = useState("")
  const [luckyColor, setLuckyColor] = useState("")
  const [luckyNumber, setLuckyNumber] = useState(0)
  const [luckyStone, setLuckyStone] = useState("")
  const [moonPhase, setMoonPhase] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    // Set random moon phase and lucky elements
    setMoonPhase(moonPhases[Math.floor(Math.random() * moonPhases.length)])
  }, [])

  const loadHoroscope = async (sign: string) => {
    if (!sign) {
      setHoroscope("")
      setLuckyColor("")
      setLuckyNumber(0)
      setLuckyStone("")
      return
    }

    setSelectedSign(sign)
    setHoroscope(mockHoroscopes[sign] || "Your horoscope is being prepared by the stars...")

    // Generate random lucky elements
    setLuckyColor(luckyElements.colors[Math.floor(Math.random() * luckyElements.colors.length)])
    setLuckyNumber(luckyElements.numbers[Math.floor(Math.random() * luckyElements.numbers.length)])
    setLuckyStone(luckyElements.stones[Math.floor(Math.random() * luckyElements.stones.length)])

    // Auto-speak horoscope
    const horoscopeText = mockHoroscopes[sign]
    if (horoscopeText) {
      setTimeout(async () => {
        await speakHoroscope(horoscopeText)
      }, 1000)
    }
  }

  const speakHoroscope = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      const fullText = `Here's your daily horoscope: ${text}`
      if (onHoroscopeSpeak) {
        await onHoroscopeSpeak(fullText)
      } else {
        await elevenLabsService.speak(fullText)
      }
    } catch (error) {
      console.error("Error speaking horoscope:", error)
    } finally {
      setIsSpeaking(false)
    }
  }

  const getSignInfo = (signValue: string) => {
    return zodiacSigns.find((sign) => sign.value === signValue)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 dark:bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              Daily Horoscope & Cosmic Motivation
            </div>
            <Select value={selectedSign} onValueChange={loadHoroscope}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Your Zodiac Sign" />
              </SelectTrigger>
              <SelectContent>
                {zodiacSigns.map((sign) => (
                  <SelectItem key={sign.value} value={sign.value}>
                    <div className="flex flex-col">
                      <span>{sign.label}</span>
                      <span className="text-xs text-muted-foreground">{sign.dates}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSign ? (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">
                      {getSignInfo(selectedSign)?.label}
                    </h3>
                    <p className="text-lg italic leading-relaxed">{horoscope}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => speakHoroscope(horoscope)}
                    disabled={isSpeaking || !horoscope}
                    className="flex items-center gap-2 shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                    {isSpeaking ? "Speaking..." : "Speak"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Moon className="w-5 h-5" />
                      Moon Phase
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-4xl mb-3">🌙</div>
                    <div className="font-semibold text-blue-800 dark:text-blue-200">{moonPhase}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      The moon's energy influences your emotional state and intuition today.
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <Gem className="w-5 h-5" />
                      Lucky Elements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-600 dark:text-amber-400">Color:</span>
                        <span className="font-semibold text-amber-800 dark:text-amber-200">{luckyColor}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-600 dark:text-amber-400">Number:</span>
                        <span className="font-semibold text-amber-800 dark:text-amber-200">{luckyNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-600 dark:text-amber-400">Stone:</span>
                        <span className="font-semibold text-amber-800 dark:text-amber-200">{luckyStone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300">Cosmic Motivation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-800 dark:text-green-200 leading-relaxed">
                    The universe is aligning to support your journey today. Trust in your path and embrace the
                    opportunities that come your way. Your {selectedSign} energy is particularly strong right now,
                    making this an excellent time to pursue your goals with confidence and determination.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Discover Your Cosmic Guidance</h3>
              <p className="text-muted-foreground mb-6">
                Select your zodiac sign above to receive your personalized daily horoscope and cosmic motivation.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
                {zodiacSigns.map((sign) => (
                  <Button
                    key={sign.value}
                    variant="outline"
                    onClick={() => loadHoroscope(sign.value)}
                    className="text-sm"
                  >
                    {sign.label.split(" ")[0]} {sign.label.split(" ")[1]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
