# Undelete Project

* **Worker** - twitter streaming client, that handles status updates and deletions and passes them to the storage.
* **L1 Storage**, or **Storage** - high-accessible fast in-memory cache. Holds several thousand recent tweets and deletions. In order to limit memory consumption, it holds only a few thousand recent tweets and deletions. Hosted in the cloud.
* **L2 Storage**, or **Repo** - client, that connects to the L1 storage, grabs all recent data and stores it forever. It also stores uncovered tweets collection.
