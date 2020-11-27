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
const requestHandler = (request, response) => {  
    var queryData = url.parse(request.url, true).query;
    var success = 0;
    ret = ""
    var seconds = null
    child_process.exec(`ping -q -w5 -c1 "${queryData.target}"`, (err, stdout, stderr) => {
        if (err) {
            ret += "# "+ err.toString().split("\n").join("\n# ") + "\n"
        } else {
            var ping = stdout.toString().split(" = ")[1].trim()
            if (!ping)
                console.error(stdout)
            seconds = ping.split("/")[0]/1000.0
            success = 1;
            if (seconds >= 1) {
                console.error(`${queryData.target} ${ping}`)
            }

            ret += `# TYPE probe_duration_seconds gauge\nprobe_duration_seconds ${seconds}\n`
        }
        ret += `# TYPE probe_success gauge\nprobe_success ${1*!err}\n`
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end(ret)
    })
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})