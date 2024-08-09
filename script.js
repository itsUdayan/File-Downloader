const inputurl = document.querySelector("input");
const button = document.querySelector("button");
const progressBar = document.querySelector("progress");

button.addEventListener("click",e=>{
    e.preventDefault();
    button.innerText = "Downloading...";
    fetchFile(inputurl.value);
    inputurl.value = "";
})

function fetchFile(url) {
    fetch(url).then(res => {
        progressBar.style.display = 'block';
        progressBar.value = 0;
        const contentLength = res.headers.get('content-length');
        if (!contentLength) {
            throw new Error('Content-Length header is missing');
        }

        const total = parseInt(contentLength, 10);
        let loaded = 0;

        const reader = res.body.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        loaded += value.length;
                        document.getElementById('downloadProgress').value = (loaded / total) * 100;

                        controller.enqueue(value);
                        push();
                    });
                }
                push();
            }
        });

        return new Response(stream);
    }).then(res => res.blob()).then(file => {
        let tempUrl = URL.createObjectURL(file);
        let aTag = document.createElement("a");
        aTag.href = tempUrl;
        aTag.download = url.replace(/^.*[\\\/]/, '');
        document.body.appendChild(aTag);
        aTag.click();
        aTag.remove();
        URL.revokeObjectURL(tempUrl);
        button.innerText = "Download";
        progressBar.style.display = 'none';
    }).catch(() => {
        button.innerText = "Download";
        alert("Failed to download file!");
        progressBar.style.display = 'none';
    });
}
