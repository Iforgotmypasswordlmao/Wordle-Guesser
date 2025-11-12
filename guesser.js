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
        console.log(guess)
        const yellow_letters = guess.replaceAll('.', '')
        const yellow_position = new RegExp(guess, 'i')
        filtered_words_from_yellow = filtered_words_from_yellow.filter((word) => {
            if (word.search(yellow_position) == -1)
            {
                for (let i in yellow_letters)
                {
                    const desired_letter = yellow_letters[i].toLowerCase()
                    if(!word.includes(desired_letter))
                    {
                        return false
                    }
                }
                return true
            }
            return false
        })
    }

    return filtered_words_from_yellow
    
}

export function sort_by_score(word_list)
{
    return word_list.sort((a, b) => (eval_word(a) - eval_word(b)))
}

