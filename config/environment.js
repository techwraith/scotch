var config = {
  realtime: true,
  model: {
    defaultAdapter: 'mongo'
  },
  db: {
    mongo: {
      dbname: 'blog'
    }
  }
};

module.exports = config;
