
import { build, serve } from "esbuild";
import { createServer, request } from "http";
import { spawn } from "child_process";

import process from "process";

const outputDir = 'dist';

/**
 * @param {http.ServerRequest} req
 * @param {http.ServerResponse} res
 * @return {boolean} Whether gzip encoding takes place
 */
 function gzip(req, res) {
	// check if the client accepts gzip
	var header = req.headers['accept-encoding'];
	var accepts = Boolean(header && /gzip/i.test(header));
	if (!accepts) return false;

	// store native methods
	var writeHead = res.writeHead;
	var write = res.write;
	var end = res.end;

	var gzip = spawn('gzip');
	gzip.stdout.on('data', function (chunk) {
		write.call(res, chunk);
	});
	gzip.on('exit', function () {
		end.call(res);
	});

	// duck punch gzip piping
	res.writeHead = function (status, headers) {
		headers = headers || {};

		if (Array.isArray(headers)) {
			headers.push([ 'content-encoding', 'gzip' ]);
		} else {
			headers['content-encoding'] = 'gzip';
		}

		writeHead.call(res, status, headers);
	};
	res.write = function (chunk) {
		gzip.stdin.write(chunk);
	};
	res.end = function () {
		gzip.stdin.end();
	};

	return true;
};


build({
    minify: true,
    entryPoints: ['src/index.ts', 'src/index.html'],
    bundle: true,
    logLevel: 'info',
    format: 'esm',
    outdir: outputDir,
    loader: {
      '.html': 'copy',
    },
    watch: {
      onRebuild(error, result) {
        clients.forEach((res) => res.write("data: update\n\n"));
        clients.length = 0;
        console.log(error ? error : "...");
      },
    },
  })
  .catch(() => process.exit(1));

serve({ servedir: "./dist" }, {}).then(() => {
  createServer((req, res) => {

    const { url, method, headers } = req;

    // 86.8 kB	

    // if(url === "/tailwindcss.worker.js") {
            
    //   readFile('./tailwindcss.worker.js.gz', function(err, data) {
    //     res.writeHead(200, {
    //       ...res.headers,
    //       'content-encoding': 'gzip',
    //     });
    //     res.write(data);

    //     res.end()
    //   });

    //   return;
    // } 



    if (req.url === "/esbuild")
      return clients.push(
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        })
      );
    const path = ~url.split("/").pop().indexOf(".") ? url : `/index.html`; //for PWA with router

    req.pipe(
      request(
        { hostname: "0.0.0.0", port: 8000, path, method, headers },
        (prxRes) => {
          if (url === "/index.js") {

            const jsReloadCode =
              ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();';

            const newHeaders = {
              ...prxRes.headers,
              "content-length":
                parseInt(prxRes.headers["content-length"], 10) +
                jsReloadCode.length,
            };

            gzip(req, res);


            res.writeHead(prxRes.statusCode, newHeaders);
            res.write(jsReloadCode);


          } else {
          
          // else if(url === "/tailwindcss.worker.js.gz") {

          //   const newHeaders = {
          //     ...prxRes.headers,
          //     "content-type": "text/javascript",
          //     'content-encoding': 'gzip'
          //   };

          //   res.writeHead(200, newHeaders);


          // } 


            res.writeHead(prxRes.statusCode, prxRes.headers);

          }
          prxRes.pipe(res, { end: true });
        }
      ),
      { end: true }
    );
  }).listen(3000);

  console.log(`Open at http://localhost:3000`);
});
