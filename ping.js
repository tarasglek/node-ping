/*
docker run --name=ping --rm  -v `pwd`/:/app node:alpine node app/ping.js
*/
const http = require('http')
const url = require('url')
const child_process = require('child_process');
const port = 3000

function maybeErr(error, response, target) {
    if (error) {
        ret += `# ${target}: ${error.toString ()}\n`
        response.end(ret)
        console.error(ret)
    }
    return ret
}

let outstandingPings = {}
let iteration = 0
const requestHandler = (request, response) => {
    let queryData = url.parse(request.url, true).query;
    let success = 0;
    let ret = ""
    let seconds = null
    let target = queryData.target
    if (target in outstandingPings) {
        outstandingPings[target].kill(9)
        console.error("killing outstanding ping for " + target)
        delete outstandingPings[target]
    }
    outstandingPings[target] = child_process.exec(`ping -q -w5 -c1 "${target}"`, (err, stdout, stderr) => {
        if (err) {
            ret += "# "+ err.toString().split("\n").join("\n# ") + "\n"
        } else {
            let ping = stdout.toString().split(" = ")[1].trim()
            if (!ping)
                console.error(stdout)
            seconds = ping.split("/")[0]/1000.0
            success = 1;
            if (seconds >= 1) {
                console.error(`${queryData.target} ${ping}`)
            }

            ret += `# TYPE probe_duration_seconds gauge\nprobe_duration_seconds{instance="${target}"} ${seconds}\n`
        }
        ret += `# ${iteration} TYPE probe_success gauge\nprobe_success{instance="${target}"} ${1*!err}\n`
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end(ret)
        firstCallback = false
    })
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})