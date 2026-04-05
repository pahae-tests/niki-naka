import styles from '../styles/globals.css'
import { useRouter } from 'next/router'
import { Trophy, Plus, Calendar, Target, Zap, Icon, Crown, Users } from 'lucide-react'

export default function MyApp({ Component, pageProps }) {
    const router = useRouter()
    return (
        <>
            <div className="border-b border-gray-800 bg-black/60 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-3 bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent" dir='rtl'>
                      فريق النيكي ناكا لي جا يتناكا
                    </h1>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => router.push('/')}
                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg ${!router.pathname.includes('players') ? 'bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 font-medium' : 'underline'} flex items-center justify-center gap-2 text-sm sm:text-base text-white`}
                      >
                        <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">Matches</span>
                        <span className="sm:hidden">Matchs</span>
                      </button>
                      <button
                        onClick={() => router.push('/players')}
                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg ${router.pathname.includes('players') ? 'bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 font-medium' : 'underline'} flex items-center justify-center gap-2 text-sm sm:text-base text-white`}
                      >
                        <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Players
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            <Component {...pageProps} />
        </>
    )
}
