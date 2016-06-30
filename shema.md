## Data Structures

buffer: SortedSet {
    score: timestamp
    member: serializedTweet
}

deletions: SortedSet {
    score: timestamp
    member: tweetId
}

tweet-id-${tweetId}: String {
    value: "1"
    ttl: 3600 * 24 * 2
}



## Use-cases

### Store tweet

```
ZADD buffer, timestamp, serializedTweet
```

### Shrink tweets buffer

```
ZREMRANGEBYRANK buffer, 0, -BUFFER_MAX_LENGTH - 1
```

, where BUFFER_MAX_LENGTH=1000.

### Set tweetId as seen

```
SETEX tweet-id-${tweetId}, TTL, 1
```

### Check that tweetId is seen

GET tweet-id-${tweetId}

### Store deletion

```
ZADD deletions, timestamp, tweetId
```

### Shrink deletions buffer

```
ZREMRANGEBYRANK deletions, 0, -DELETIONS_BUFFER_MAX_LENGTH - 1
```

### Get recent tweets

```
ZRANGEBYSCORE buffer, sinceTimestamp, +inf
```

### Get recent deletions
