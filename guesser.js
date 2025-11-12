import { letter_frequency_rank, potential_answers } from "./answers.js"

export function eval_word(guess)
{
    let eval_sum = 0
    let dupe_counter = {}
    for (let letters in guess)
    {
        const letter = guess[letters].toUpperCase()
        if (!dupe_counter[letter])
        {
            dupe_counter[letter] = 0
        }
        dupe_counter[letter] += 1
        if (dupe_counter[letter] > 1)
        {
            eval_sum += 10
        }
        eval_sum += letter_frequency_rank[letter]
    }
    return eval_sum
}

export function search_for_word(gray_letters, yellow_letters_history, green_letters)
{
    const blank_word = ['.', '.', '.', '.', '.']
    const grey_letters_search =  new RegExp(`[${gray_letters.join("")}]`, "i")
    const green_letters_search = new RegExp(green_letters.join(""), "i")

    const filtered_words_from_green = potential_answers.filter((word) => {
        return word.search(green_letters_search) != -1
    })


    const filtered_words_from_gray = filtered_words_from_green.filter((word) => {
        return (word.search(grey_letters_search) == -1)
    }) 

    let filtered_words_from_yellow = filtered_words_from_gray
    for (let guesses in yellow_letters_history)
    {
        const guess = yellow_letters_history[guesses].join("")
        if (guess == ".....")
        {
            continue
        }

        const yellow_letters = guess.replaceAll('.', '')
        const yellow_positions = []
        
        for (let l in yellow_letters)
        {
            const lett = yellow_letters[l]
            const index = guess.indexOf(lett)
            let b = [...blank_word]
            b[index] = lett
            yellow_positions.push(b.join(""))
        }

        filtered_words_from_yellow = filtered_words_from_yellow.filter((word) => {
            for (let p in yellow_positions)
            {
                const pl = new RegExp(yellow_positions[p], 'i')
                if (word.search(pl) != -1)
                {
                    return false
                }
            }
            for (let pa in yellow_letters)
            {
                const pb = yellow_letters[pa].toLowerCase()
                if (!word.includes(pb))
                {
                    return false
                }
            }
            return true
        })
    }

    return filtered_words_from_yellow
    
}

export function sort_by_score(word_list)
{
    return word_list.sort((a, b) => (eval_word(a) - eval_word(b)))
}

