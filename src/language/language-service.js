
const SLL = require('../SLL/SLL')


// Set up initial data.
// --------------------






const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },
  getUserWord(db, user_id) {
    return db
      .from('word')
      .select(
        'word.id',
        'word.original',
        'word.translation',
        'word.memory_value',
        'word.correct_count',
        'word.incorrect_count',
        'word.language_id',
        'language.total_score',
        'language.head'
      )
      .join('language',
        'language.id',
        'word.language_id'
      )

      .where(function () {
        this
          .where('language.user_id', user_id)
          .whereRaw('word.id = language.head')
      })


  },
  getUserWords(db, user_id) {
    return db
      .from('word')
      .select(
        'word.id',
        'word.original',
        'word.translation',
        'word.memory_value',
        'word.correct_count',
        'word.next',
        'word.incorrect_count',
        'word.language_id',
        'language.total_score',
        'language.head'
      )
      .join('language',
        'language.id',
        'word.language_id'
      )

      .where(function () {
        this
          .where('language.user_id', user_id)

      })


  },
  getList(db, user_id, head) {
    return db
      .from('word')
      .select(
        'word.id',
        'word.original',
        'word.translation',
        'word.memory_value',
        'word.correct_count',
        'word.incorrect_count',
        'word.next',
        'word.language_id',
        'language.total_score',
        'language.head'
      )
      .join('language',
        'language.id',
        'word.language_id'
      )

      .where('language.user_id', user_id)
      
      .returning()
      .then(words => {
      
        let LinkedWords = new SLL()
      
        let node = words.find(word => word.id === head); 
        while (node) { 
          LinkedWords.insertLast(node);
         node = words.find(word => word.id === node.next)
         }
         
         return LinkedWords.all()
      }
      )
  },
  getNewList(db, user_id, head) {
    return db
      .from('word')
      .select(
        'word.id',
        'word.original',
        'word.translation',
        'word.memory_value',
        'word.correct_count',
        'word.incorrect_count',
        'word.next',
        'word.language_id',
        
      )
      .join('language',
        'language.id',
        'word.language_id'
      )

      .where('language.user_id', user_id)
      
      .returning()
      .then(words => {
        let LinkedWords = new SLL()
      
        let node = words.find(word => word.id === head); 
        while (node) { 
          LinkedWords.insertLast(node);
         node = words.find(word => word.id === node.next)
         }
        //  LinkedWords.insertAt(1, updatedfields)
        // console.log('UPDATED FIELDS:', updatedfields)
        //  LinkedWords.shift()
         LinkedWords.move(LinkedWords.head.value.memory_value)
         //LinkedWords.updateNext()
        // console.log('MEMORY_VAL:', LinkedWords.head.value.memory_value)
         return LinkedWords.getNextIds()
      }
      )
  },
  isGuessCorrect(db, user_id, guess) {
    return db
      .from('word')
      .select(
        'word.id',
        'word.original',
        'word.translation',
        'word.memory_value',
        'word.correct_count',
        'word.incorrect_count',
        'word.language_id',
        'word.next',
        'language.total_score',
        'language.head'
      )
      .join('language',
        'language.id',
        'word.language_id'
      )

      .where(function () {
        this
          .where('language.user_id', user_id)
          .whereRaw('word.id = language.head')
      })
      .returning()
      .then(result => {
       
       return{right:(result[0].translation===guess.guess),
        id: result[0].id,
        incorrect: result[0].incorrect_count,
        correct: result[0].correct_count,
        memory: result[0].memory_value,
        next: result[0].next
       }
  })


},
  updateWord(knex, id, updatedFields){
    return knex('word')
    .where({ id })
    .update(updatedFields)
   
  },
  updateScore(knex, id, fieldstoUpdate){
    //  console.log('updateIDs',ids)

   return knex('word')
   .where({id})
   .update(fieldstoUpdate)    

  },

  updateIds(knex, id, next){
    //  console.log('updateIDs',ids)

   return knex('word')
   .where({id})
   .update(next)    

  },
  updateTotal(knex, id, total_score){
    console.log('**************total-score:',total_score)
     return knex('language')
     .where({ id })
     .update(total_score)
    
   },
updateHead(knex, id, head){
 console.log(head)
  return knex('language')
  .where({ id })
  .update({head})
 
}


}
//update HEAD
// updateAllWords(knex, newList){
//     console.log('***NEW:',[newList])
// knex('word').update(...newList)
// .returning()
// .then(res=>{
//   console.log(res)
// })


// },
// updateAllWords(knex, languageId) {



    // when inserting words,
    // we need to know the current sequence number
    // so that we can set the `next` field of the linked language
 

    // const languageWords = [
    //   ['au bord', 'by', 12],
    //   ['brume', 'mist', 13],
    //   ['nuages', 'clouds', 14], 
    //   ['chaque', 'every', 15],
    //   ['doux', 'soft', 16],
    //   ['épatant', 'amazing', 17],
    //   ['vouloir', 'to want', 18],
    //   ['alors', 'while', 19],
    //   ['chanceux', 'lucky', 20],
    //   ['bâtir', 'build', null],
    // ]
      
    //   knex('word')
    //   .update(
    //    languageWords.map(([original, translation, nextInc]) => ({
    //       language_id: languageId,
    //       original,
    //       translation,
    //       next: nextInc
    //         ? nextInc
    //         : null
    //     })),
    //   )
    //   .returning()
    //   .then(res=>
    //     console.log('RES*********:', res))

    // await knex('language')
    //   .where('id', languageId)
    //   .update({
    //     head: languageId,
    //   })

// },

// updateHead(knex, id, head){
 
//   return knex('language')
//   .where({ id })
//   .update(head)
 
// }




module.exports = LanguageService
// hasUserWithUserName(db, username) {
//   return db('user')
//     .where({ username })
//     .first()
//     .then(user => !!user)
// },