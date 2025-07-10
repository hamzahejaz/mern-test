This indexing strategy is optimized for our feed system in two key ways:

1. **Reverse Chronological Sorting (`{ createdAt: -1 }`)**
   Most feeds display recent posts first. By indexing on `createdAt` in descending order, MongoDB can efficiently serve queries that sort by newest posts — without scanning the entire collection or using an in-memory sort. This is essential for high-performance feed delivery.

2. **Compound Index (`{ author: 1, createdAt: -1 }`)**
   This compound index is ideal for fetching posts by a specific author sorted by recency — which is exactly what the `$lookup` + post sorting stage needs. MongoDB uses the prefix rule, so this index supports:

   * `find({ author })` queries
   * `find({ author }).sort({ createdAt: -1 })` efficiently
     This avoids full collection scans and enables fast range queries per author.

Together, these indexes align perfectly with our aggregation pipeline, reducing query time and improving scalability for user feeds.
    