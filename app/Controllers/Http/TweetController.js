'use strict'

const Tweet = use('App/Models/Tweet')
const Reply = use('App/Models/Reply')

class TweetController {

  async tweet ({ request, auth, response }) {
    // current user
    const user = auth.current.user

    // save tweet to db
    const tweet = await Tweet.create({
      user_id: user.id,
      tweet: request.input('tweet')
    })

    // fetch tweet's relations
    await tweet.loadMany(['user', 'favorites', 'replies'])

    return response.json({
      status: 'success',
      message: 'Tweet posted!',
      data: tweet
    })
  }

  async show ({ params, response }) {
    try {
      const tweet = await Tweet.query()
        .where('id', params.id)
        .with('user')
        .with('replies')
        .with('replies.user')
        .with('favorites')
        .firstOrFail()

      return response.json({
        status: 'success',
        data: tweet
      })
    }
  }

  async reply ({ request, auth, params, response }) {
    // current user
    const user = auth.current.user

    // get tweet with specified ID
    const tweet = await Tweet.find(params.id)

    // persist to database
    const reply = await Reply.create({
      user_id: user.id,
      tweet_id: tweet.id,
      reply: request.input('reply')
    })

    await reply.load('user')

    return response.json({
      status: 'success',
      message: 'Reply posted!',
      data: reply
    })
  }

  async destroy ({ request, auth, params, response }) {
    // current user
    const user = auth.current.user

    // get tweet with specified ID
    const tweet = await Tweet.query()
      .where('user_id', user.id)
      .where('id', params.id)
      .firstOrFail()

    await tweet.delete()

    return response.json({
      status: 'success',
      message: 'Tweet deleted!',
      data: null
    })
  }

}

module.exports = TweetController
