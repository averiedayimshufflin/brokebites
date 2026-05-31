'use client'

import { useEffect, useState } from "react"
import {Input} from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

export default function DemoFilterTags() {
    const [inputValue, setInputValue] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [visibleRecipeCount, setVisibleRecipeCount] = useState(0)
    
    const demoTags = ["rice", "beans", "eggs"]

    const demoRecipes = [
    
         {
    title: "Egg Fried Rice",
    description: "Uses rice, eggs, and pantry basics.",
    tags:  ["eggs","rice"]
  },
  {
    title: "Bean & Rice Bowl",
    description: "A cheap filling meal with simple ingredients.",
    tags:  ["beans","rice"]
  },
  {
    title: "Budget Breakfast Scramble",
    description: "Eggs with whatever extras you have.",
    tags: ["eggs"]
  },
    
    ]


     useEffect(() => {
    let wordIndex = 0
    let letterIndex = 0
    
    const wordInterval = setInterval(() => {
      const currentWord = demoTags[wordIndex]

      if (!currentWord) {
        clearInterval(wordInterval)
        return
      }

      if (letterIndex < currentWord.length) {
        const currentLetter = currentWord.charAt(letterIndex)
        letterIndex++
        
      

        setInputValue(prev => prev + currentLetter)
       
       
        return
      }

      setTags((currentTags) => [...currentTags, currentWord])
      setInputValue("")

      wordIndex++
      letterIndex = 0
    }, 300)

    
    return () => clearInterval(wordInterval)
  }, [])

  useEffect(() => {
  if (tags.length !== demoTags.length) return
  if (visibleRecipeCount >= demoRecipes.length) return

  const timer = setTimeout(() => {
    setVisibleRecipeCount(count => count + 1)
  }, 1000)

  return () => clearTimeout(timer)
}, [tags.length, visibleRecipeCount])

  function displayTags(recipeTags: string[]){
    return(
       <div className="flex flex-wrap gap-2 min-h-8">
                {recipeTags.map((recipeTag)=>(
                    <Badge
                        key = {recipeTag}
                        variant = "secondary"
                        className = "rounded-full px-3 py-1"
                        >
                            {recipeTag}
                    </Badge>
                ))}
            </div>
    )
}
  

    return(
    <>
    <div className = "flex-col space-y-9">
    <Card className = "w-full max-w-xl rounded-2xl shadow-sm opacity-50 focus:ring">
        <CardHeader>
            <CardTitle>Find recipes from your pantry</CardTitle>
            <CardDescription>
                Add ingredients and BrokeBites filters meals instantly
            </CardDescription>
        </CardHeader>
    </Card>

        <CardContent className = "space-y-4">
            <Input
            placeholder="Enter ingredients here..."
            value = {inputValue}
            readOnly
            />

            <div className="flex flex-wrap gap-2 min-h-8">
                {tags.map((tag)=>(
                    <motion.div 
                    key = {tag}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.50, ease: "easeOut" }}>
                    <Badge
                        key = {tag}
                        variant = "secondary"
                        className = "rounded-full px-3 py-1"
                        >
                            {tag} ×
                    </Badge>
                    </motion.div>
                ))}
            </div>

            {tags.length===demoTags.length && (
                <div className="space-y-3 max-w-md">
                    {demoRecipes.slice(0,visibleRecipeCount).map((recipe)=> (
                        <motion.div
                        key={recipe.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.50, ease: "easeOut" }}
  className="rounded-xl border p-4"
>
                        <Card
                            key={recipe.title}
                            className="rounded-xl border p-4 style={{ opacity, transition-opacity duration-150 ${opacity ? 'opacity-100' : 'opacity-0'}` }"
                            >
                            <h3 className="font-medium">{recipe.title}</h3>
                            <p className="text-sm text-muted-foreground">
                            {recipe.description}

                            </p>
                              {displayTags(recipe.tags)}
                        </Card>
                        </motion.div>
                    ))
                    }
                   
                </div>
            )}


        </CardContent>
        </div>
    </>
    );
}