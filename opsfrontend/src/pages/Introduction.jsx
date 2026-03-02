import logo from "../assets/logoa.png";
import logo1 from "../assets/arena.png";
import { useNavigate } from "react-router-dom";
import Particles from '../components/Particles.jsx'
import { useState } from "react";

export default function IntroductionPage() {
    const navigate = useNavigate();
    const [showKnowMore, setShowKnowMore] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] 
                    text-gray-900 dark:text-gray-100 
                    transition-colors flex flex-col">

        <div className='absolute inset-0 z-0'>
        <Particles
          particleColors={["#ffffff", "#a5b4fc", "#c084fc"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>                

      <div className="p-6  transition-all duration-300  active:scale-95 animate-pulse [animation-duration:1s]">
        <img src={logo} alt="Arena Ops" className="h-[90px] w-auto" />
      </div>

      
      <div className="flex flex-1 flex-col items-center justify-center text-center px-6 space-y-6 mt-[-200px]">

        <img src={logo1} alt="Arena" className="h-24 w-auto" />

        <h1 className="text-3xl md:text-4xl font-semibold">
          Welcome to Arena{" "}
          <span className="text-4xl text-orange-500">Ops</span>
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl">
          Your command center for productivity and teamwork.
        </p>

        <p className="text-md text-gray-500 dark:text-gray-500 max-w-lg">
          Build faster, collaborate smarter, and turn ideas into action effortlessly.
        </p>
       <div className="flex items-center z-10 gap-4 justify-center mt-12">
            <button 
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-full text-white text-lg font-bold bg-gray-700  hover:bg-white hover:text-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105 active:scale-95 border-0 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            >
                Get Started
            </button>
            <button onClick={()=>setShowKnowMore(true)} className="px-6 py-3 rounded-full text-white text-lg font-bold bg-gray-700 hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105 active:scale-95 border-0 focus:outline-none focus:ring-4">
                Know More
            </button>
        </div>

      </div>
      {/* Know More Modal */}
            {showKnowMore && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                About Arena Ops
                            </h2>
                            <button
                                onClick={() => setShowKnowMore(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-110"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6 text-left">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">🚀 Features</h3>
                                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <li className="flex items-start gap-3">
                                        <span className="text-orange-500 font-bold text-xl mt-0.5">✓</span>
                                        Real-time team collaboration
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-orange-500 font-bold text-xl mt-0.5">✓</span>
                                        Task & project management
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-orange-500 font-bold text-xl mt-0.5">✓</span>
                                        Advanced analytics dashboard
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-orange-500 font-bold text-xl mt-0.5">✓</span>
                                        Custom workflows & automation
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">⚡ Why Choose Us?</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-2xl border border-orange-200 dark:border-orange-800">
                                        <h4 className="font-bold text-orange-700 dark:text-orange-300 mb-2">Lightning Fast</h4>
                                        <p className="text-sm text-orange-600 dark:text-orange-400">Built for speed with React + modern APIs</p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                                        <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">Secure & Scalable</h4>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">Enterprise-grade security for teams</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-gray-600 dark:text-gray-400 italic">
                                    "Transform your team's productivity with Arena Ops today."
        </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button 
                                onClick={() => navigate("/signup")}
                                className="flex-1 px-6 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-orange-500 to-orange-600 
                                           hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Start Free Trial
                            </button>
                            <button
                                onClick={() => setShowKnowMore(false)}
                                className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 
                                           hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
}
