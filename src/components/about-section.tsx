export function AboutSection() {
    return (
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-white">About Realm Rivals</h2>
  
            <div className="mb-12 text-gray-300 text-lg space-y-6">
              <p>
                Realm Rivals is a cutting-edge 3D battle arena game where players collect, customize, and battle with
                unique characters from across different realms.
              </p>
              <p>
                Our team of passionate developers and artists has crafted an immersive gaming experience that combines
                stunning visuals with engaging gameplay mechanics.
              </p>
              <p>
                Whether youre a casual gamer looking for fun or a competitive player aiming for the top of the
                leaderboards, Realm Rivals offers something for everyone.
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-700 p-6 rounded-xl">
                <div className="text-4xl font-bold text-purple-500 mb-2">50+</div>
                <div className="text-white">Unique Characters</div>
              </div>
              <div className="bg-gray-700 p-6 rounded-xl">
                <div className="text-4xl font-bold text-cyan-500 mb-2">10+</div>
                <div className="text-white">Battle Arenas</div>
              </div>
              <div className="bg-gray-700 p-6 rounded-xl">
                <div className="text-4xl font-bold text-purple-500 mb-2">1M+</div>
                <div className="text-white">Active Players</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
  