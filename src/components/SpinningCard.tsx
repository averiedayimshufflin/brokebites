export default function SpinningCard() {
    const featureCards = [
    { icon: "ti-coin",      img: "/images/budget.jpg",   title: "Under $5 meals",      desc: "Eat well without breaking the bank" },
  { icon: "ti-clock",     img: "/images/quick.jpg",    title: "10-minute meals",      desc: "Fast recipes for busy days" },
  { icon: "ti-microwave", img: "/images/microwave.jpg",title: "Microwave-only meals", desc: "No stove or oven needed" },
  { icon: "ti-barbell",   img: "/images/protein.jpg",  title: "High-protein meals",   desc: "Fuel your body and goals" },
    ]
    
    return(
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {featureCards.map((f) => (
        <div key={f.title} className="relative rounded-2xl overflow-hidden h-48 cursor-pointer group">
          <img
            src={f.img}
            alt={f.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/50 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-1">
              <i className={`ti ${f.icon} text-white text-sm`} />
              <span className="text-white text-sm font-medium">{f.title}</span>
            </div>
            <p className="text-white/75 text-xs leading-snug">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
    
