/*
*
*
*       Complete the API routing below
*
*
*/


// bugs
// shops not subs
// identation
// maybe add a extra page feature instead of just limiting to 10 
// click out to close sub listings


'use strict';

var expect = require('chai').expect;
let mongoose = require('mongoose')
let shortid = require('shortid')

mongoose.connect(process.env.DB);

let thread = mongoose.Schema({
    _id: String,
    board: String,
    text: String, 
    created_on: String, 
    bumped_on: String, 
    reported: Boolean, 
    delete_password: String, 
    replycount: Number,
    replies: [
      {
                _id:String, 
                created_on:String, 
                text: String, 
                delete_password:String,
                reported:Boolean, 
                bumped_on: String
    }
    ]
  })

let Thread = mongoose.model('Thread', thread)

module.exports = function(app) {
  
  let a = 0
  let b = 0
  
  app.get('/api/threads/donuts',function(req,res,done) {
    Thread.find({},function(err,data){
      if(err) done(err)
      res.json(data)
    }).limit(7)
  })
  
  app.route('/api/home').get(function(req,res){
      res.redirect('/')
    })
  
  app.route('/donuts/:monkeys/:dogs').get(function(req,res) {
    res.redirect('/b/'+req.params.monkeys+'/'+req.params.dogs+'/')
  })
  
  app.route('/coco/:monkeys').get(function(req,res) {
    res.redirect('/b/'+req.params.monkeys+'/')
  })
  
  app.route('/api/threads/:board')
    .post(function(req,res,done) {
       res.redirect('/b/'+ req.params.board+'/')
      // console.log('yiooo')
      // Thread.find({board:req.params.board}, function(req,res,data){
      //     if(!data) {
            
           let newThread = new Thread({
           board: req.params.board,
           _id: shortid.generate(),
           text: req.body.text,
           created_on: new Date().toUTCString(),
           bumped_on: new Date().toUTCString(),
           reported: false, 
           delete_password: req.body.delete_password,
           replycount: 0,
           replies: []
          })
        newThread.save(function(err, data) {
           if(err) done(err)
          // console.log('brah brah brah')
           })
            
          // } else {
          //    console.log('yo') 
          // }
        // })
      })
    
  .get(function(req,res,done) {
      Thread.find({board:req.params.board}, function(err, data) {
        if(err) done(err)
        res.json(data)
      })
    })
  
    .delete(function(req,res,done){
    // console.log(req.body)
         Thread.findOne({_id: req.body.thread_id}, function(err, data) {
           if(err) done(err)
           if(!data) {res.json('incorrect password')}
        else {
          if(req.body.delete_password === data.delete_password) {
        Thread.findOneAndRemove({_id: req.body.thread_id, delete_password: req.body.delete_password}, function(err, data) {
          if(err) done(err)
          res.json('success')
        })} else {
          res.json('incorrect password')
        }
     }})  
    })
  .put(function(req,res,done) {
      Thread.findByIdAndUpdate({_id: req.body.report_id}, {reported: true},function(err, data) {
        if(err) done(err)
        if(!data) {res.json('thread not found')}
        else {res.json('reported')}
        })
      })
    
  app.route('/api/replies/:board')
      .post(function(req,res,done) {
        res.redirect('/b/'+req.params.board+'/'+req.body.thread_id+'/')
    
    Thread.findByIdAndUpdate({_id:req.body.thread_id}, {bumped_on: new Date().toUTCString(), $inc:{replycount: 1},
                                  $push: {
                                    replies:
                                   {
                                    _id: shortid.generate(), 
                                    created_on: new Date().toUTCString(), 
                                    text: req.body.text, 
                                    delete_password:req.body.delete_password,
                                    reported:false
                                   }
                                 }
                               }, function(err,data) {
          if(err) done(err)
            })
          })
  
      .get(function(req,res,done) {
          let keys = Object.keys(req.query)
          let values = Object.values(req.query)
          
          if(req.query.thread_id) {
          Thread.find({_id:req.query.thread_id}, function(err, data) {
              if(err) done(err)
            res.json(data)
          })}
        })
  .delete(function(req,res,done){
    
   Thread.findByIdAndUpdate({_id: req.body.thread_id}, {$inc:{replycount: -1}} ,function(err, data) {
        if(err) done(err)
        if(!data) {res.json('incorrect password')}
        else if(data) {
          if(err) done(err) 
          
          let a = 'incorrect password'
            
            data.replies.filter(x => {
              if(x.id===req.body.reply_id&&x.delete_password===req.body.delete_password) {
                let deleted = data.replies.indexOf(x)
                data.replies.splice(deleted,1)
                 a = 'success'
              }
              else {
                console.log('nahh')
              }
            })
            
          data.save(function(err, data) {
            if(err) done(err)
            res.json(a)
            })
          } 
        })
    })
  
  .put(function(req,res,done) {
    // console.log(req.body)
      Thread.findById({_id: req.body.thread_id}, function(err, data) {
        if(err) done(err)
        else if(!data) {res.json('Invalid id')}
        else {
          data.replies.some(x => {
            if(x._id === req.body.reply_id) {
              x.reported = true
              res.json('success')
            } else {
              res.json('invalid id')
            }
          })
          data.save(function(err, data) {
            if(err) done(err)
            res.json('reported')
            })
          }
        })
      })
}

// Do not allow DNS prefetching.

// Only allow your site to send the referrer for your own pages.

// I can POST a thread to a specific message board by passing form data text 
// and delete_password to /api/threads/{board}.(Recomend res.redirect to board page 
// /b/{board}) Saved will be _id, text, created_on(date&time), bumped_on(date&time, 
// starts same as created_on), reported(boolean), delete_password, & replies(array).

// I can POST a reply to a thead on a specific board by passing form data text, 
//   delete_password, & thread_id to /api/replies/{board} and it will also update 
//   the bumped_on date to the comments date.(Recomend res.redirect to thread page 
// /b/{board}/{thread_id}) In the thread's 
// 'replies' array will be saved _id, text, created_on, delete_password, & reported.
                                           
                                           
// I can GET an array of the most recent 10 bumped threads on the board with 
//   only the most recent 3 replies from /api/threads/{board}. The reported and 
//   delete_passwords fields will not be sent.
  
// I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields.

// I can delete a thread completely if I send a DELETE request to 
// /api/threads/{board} and pass along the thread_id & delete_password. 
// (Text response will be 'incorrect password' or 'success')

// I can delete a post(just changing the text to '[deleted]') if 
//   I send a DELETE request to /api/replies/{board} and pass along the 
//   thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')

// I can report a thread and change it's 
// reported value to true by sending a PUT request to /api/threads/{board} 
// and pass along the thread_id. (Text response will be 'success')

// I can report a reply and change it's reported value to true by sending a
// PUT request to /api/replies/{board} and pass along the thread_id & reply_id. (Text response will be 'success')
// Complete functional tests that wholely test routes and pass.
