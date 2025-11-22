// ==UserScript==
// @name         북토끼 소설다운
// @version      0.0.1
// @description  북토끼 소설 downlaod
// @author       www
// @match        https://*.com/novel/*
// @grant        GM_registerMenuCommand
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip-utils/0.1.0/jszip-utils.js
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // 현재 url 체크
    const currentURL = document.URL;
    if (!currentURL.match(/^https:\/\/booktoki[0-9]+.com\/novel\/[0-9]+/)) {
        return;
    }
    function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), ms);
        })
    }

    // iframe 로딩 (10초 타임아웃)
    function waitIframeLoad(iframe, url) {
        return new Promise((resolve, reject) => {
            let loaded = false;

            const timer = setTimeout(() => {
                if (!loaded) {
                    reject(new Error("iframe load timeout → " + url));
                }
            }, 10000);

            iframe.onload = () => {
                clearTimeout(timer);
                loaded = true;
                resolve();
            };

            iframe.src = url;
        });
    }

    // 최소·최대 랜덤 딜레이
    const MIN_DELAY = 4200;
    const MAX_DELAY = 6300;

    // 무적권 랜덤이지
    function getDelay() {
        return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
    }

    async function doDownload(startIndex, lastIndex) {
        // JSZip 생성
        const zip = new JSZip();

        try {
            // 리스트들 가져오기
            let list = Array.from(document.querySelector('.list-body').querySelectorAll('li')).reverse();

            // startIndex가 있다면
            if (startIndex) {
                while (true) {
                    let num = parseInt(list[0].querySelector('.wr-num').innerText);
                    if (num < startIndex) {
                        list.shift();
                    } else {
                        break;
                    }
                }
            }
            // lastIndex가 있다면
            if (lastIndex) {
                while (true) {
                    let num = parseInt(list.at(-1).querySelector('.wr-num').innerText);
                    if (lastIndex < num) {
                        list.pop();
                    } else {
                        break;
                    }
                }
            }

            // 제목 가져오기 - 처음 제목과 마지막 제목을 제목에 넣는다.            
            const firstName = list[0].querySelector('a').innerHTML.replace(/<span[\s\S]*?\/span>/g, '').trim();
            const lastName = list.at(-1).querySelector('a').innerHTML.replace(/<span[\s\S]*?\/span>/g, '').trim();
            let rootFolder = `소설 ${firstName} - ${lastName}`;

            // iframe생성
            const iframe = document.createElement('iframe');
            iframe.width = 600;
            iframe.height = 600;
            document.querySelector('.content').prepend(iframe);

            let startIndexNum = parseInt(startIndex, 10);
            if (isNaN(startIndexNum)) {
                startIndexNum = 1;
            }
            let currnetFileName;
            let lastFileName="not started";
            // read download loop
            for (let i = 0; i < list.length; i++) {
                const aTag = list[i].querySelector('a');
                const currnetFileName = aTag.innerHTML.replace(/<span[\s\S]*?\/span>/g, '').trim();
                const num = list[i].querySelector('.wr-num').innerText.padStart(4, '0');
                const src = aTag.href;

                console.clear();
                console.log(`(현재 ${startIndexNum + i} 번째 → ${startIndexNum + list.length - 1} 번째 까지)[${i + 1}/${list.length}] 다운로드 중 → ${currnetFileName} `);

                try {
                    await waitIframeLoad(iframe, src);
                    const delay = getDelay();
                    console.log(`딜레이: ${delay}ms 대기 중...`);
                    await sleep(delay);

                    const iframeDocument = iframe.contentWindow.document;
                    const textNode = iframeDocument.querySelector('#novel_content');

                    if (!textNode) {
                        throw new Error("본문 요소를 찾을 수 없음");
                    }

                    const fileContent = textNode.innerText;
                    zip.file(`${num} ${currnetFileName}.txt`, fileContent);                    
                    
                    // zip 에서 오류가 났겠느냐고
                    lastFileName = currnetFileName;
                } catch (itemErr) {
                    console.error("다운로드 중 오류 발생:", itemErr);
                    console.log("여기까지 ZIP 저장을 진행합니다.");
                    rootFolder = `소설 ${firstName} - ${lastFileName}`;

                    break; // 즉시 종료 → 지금까지 저장된 zip으로 처리                    
                }
            }
            // iframe제거
            iframe.remove();

            // 파일 생성후 다운로드
            console.log(`다운로드중입니다... 잠시 기다려주세요`);
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            // ZIP 파일 이름 지정
            link.download = rootFolder;
            link.click();
            // 메모리 해제
            URL.revokeObjectURL(link.href);
            link.remove();
            console.log(`다운완료`);
        } catch (error) {
            alert(`다운로드중 오류발생: ${currentURL}\n` + error);
            console.error(error);
        }
    }
    // ui 추가
    GM_registerMenuCommand('전체 다운로드', () => doDownload());
    GM_registerMenuCommand('N번 부터 끝가지', () => {
        const startPageInput = prompt('몇번째 회차부터 다운로드 할까?', 1);
        doDownload(startPageInput);
    });
    GM_registerMenuCommand('N번 부터 M번 까지', () => {
        const startPageInput = prompt('몇번째 부터 다운로드 할까?', 1);
        const endPageInput = prompt('몇번째 까지 다운로드 할까?', 2);
        doDownload(startPageInput, endPageInput);
    });
})();