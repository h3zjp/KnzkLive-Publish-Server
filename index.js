const { NodeMediaCluster, NodeMediaServer } = require('node-media-server'),
    axios = require('axios'),
    conf = require('./config');

const numCPUs = require('os').cpus().length;

let config = {
    rtmp: {
        port: 1935,
        chunk_size: 100000,
        gop_cache: false,
        ping: 60,
        ping_timeout: 30
    },
    http: {
        port: conf.http_port,
        allow_origin: '*'
    },
    cluster: {
        num: numCPUs
    },
    knzklive: {
        api_endpoint: conf.endpoint,
        api_key: conf.APIKey
    }
    /*
    trans: {
        ffmpeg: '/usr/local/bin/ffmpeg',
        tasks: [
            {
                app: 'live',
                ac: 'aac',
                hls: true,
                hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                dash: true,
                dashFlags: '[f=dash:window_size=3:extra_window_size=5]'

            }
        ]
    }
    */
};

if (conf.https_port) {
    config["https"] = {
      port: conf.https_port,
      cert: conf.https_cert,
      key: conf.https_key,
    };
}

const nmcs = new NodeMediaServer(config);
nmcs.run();

nmcs.on('prePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nmcs.on('donePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    axios.get(`${conf.endpoint}publish.php?token=${args.token}&live=${StreamPath}&authorization=${conf.APIKey}&mode=done_publish`).then(response => {
    }).catch(error => {
        console.log('[donePublish]', error);
    })
});

nmcs.on('postPlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    axios.get(`${conf.endpoint}play.php?live=${StreamPath}&authorization=${conf.APIKey}&mode=post_play`).then(response => {
    }).catch(error => {
        console.log('[postPlay]', error);
    })
});

nmcs.on('donePlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    axios.get(`${conf.endpoint}play.php?live=${StreamPath}&authorization=${conf.APIKey}&mode=done_play`).then(response => {
    }).catch(error => {
        console.log('[donePlay]', error);
    })
});