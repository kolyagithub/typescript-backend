export let config = {
    app: {
        "host": "http://192.168.1.188",
        "port": 3004,
        "cluster": true
    },
    redis: {
        "host":
            "localhost",
        "port":
            6379,
        "PID":
            "PID:",
        "channelType":
            "development"
    },
    mongoose: {
        "url":
            "mongodb://localhost:27017/sampleDB",
        "options":
            {
                "useMongoClient":
                    true,
                "server":
                    {
                        "auto_reconnect":
                            true
                    }
            }
    }
};