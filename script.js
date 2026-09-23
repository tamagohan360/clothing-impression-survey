// ========================================
// GitHubの設定
// ========================================

const GITHUB_USER =
    "tamagohan360";

const REPOSITORY =
    "clothing-impression-survey";

const IMAGE_FOLDER =
    "images";


// ========================================
// Google Apps Script
// ========================================

const GAS_URL =
    "https://script.google.com/macros/s/AKfycbx3vVfXUkettnN0jTuwgTGYJpoP0GRloUj6qhhwEBHIEWqhKjAyEPk7gwnl0Rw1DGIa/exec";


// ========================================
// 回答者ID
// ========================================

let respondentId = null;


// ========================================
// 回答者IDを取得
// ========================================

async function getRespondentId() {

    // このブラウザですでにIDを取得していれば再利用
    const savedId =
        localStorage.getItem("respondentId");

    if (savedId) {

        respondentId = savedId;

        console.log(
            "保存されている回答者ID:",
            respondentId
        );

        return respondentId;
    }


    // Google Apps Scriptから新しいIDを取得
    const response =
        await fetch(GAS_URL);

    if (!response.ok) {

        throw new Error(
            "回答者IDを取得できませんでした"
        );

    }


    const data =
        await response.json();


    if (!data.success) {

        throw new Error(
            "回答者IDの発行に失敗しました"
        );

    }


    respondentId =
        data.respondentId;


    // ブラウザに保存
    localStorage.setItem(
        "respondentId",
        respondentId
    );


    console.log(
        "新しい回答者ID:",
        respondentId
    );


    return respondentId;
}


// ========================================
// GitHubから画像一覧を取得
// ========================================

async function getImages() {

    const url =
        `https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/contents/${IMAGE_FOLDER}`;

    console.log(
        "画像取得URL:",
        url
    );


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `GitHub APIエラー: ${response.status}`
        );

    }


    const files =
        await response.json();


    const imageFiles =
        files.filter(file => {

            return (
                file.type === "file" &&
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
            );

        });


    console.log(
        "取得した画像数:",
        imageFiles.length
    );


    return imageFiles;
}


// ========================================
// 配列をシャッフル
// ========================================

function shuffle(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;
}


// ========================================
// 質問を作成
// ========================================

async function createQuestions() {

    const questions =
        document.getElementById("questions");


    const loading =
        document.getElementById("loading");


    const error =
        document.getElementById("error");


    const submitButton =
        document.getElementById("submitButton");


    try {

        // ------------------------------------
        // 回答者IDを取得
        // ------------------------------------

        await getRespondentId();


        console.log(
            "今回の回答者ID:",
            respondentId
        );


        // ------------------------------------
        // GitHubから画像取得
        // ------------------------------------

        const images =
            await getImages();


        if (images.length < 5) {

            throw new Error(
                `画像が5枚未満です。現在 ${images.length} 枚です。`
            );

        }


        // ------------------------------------
        // ランダムに5枚選択
        // ------------------------------------

        const selectedImages =
            shuffle(images).slice(0, 5);


        // ------------------------------------
        // 画像表示
        // ------------------------------------

        selectedImages.forEach(
            (image, index) => {

                const question =
                    document.createElement("div");


                question.className =
                    "question";


                // 画像ファイル名を保存
                question.dataset.image =
                    image.name;


                question.innerHTML = `

                    <h2>
                        画像 ${index + 1}
                    </h2>

                    <img
                        src="${image.download_url}"
                        alt="服の画像"
                    >

                    <label>
                        印象語 1
                    </label>

                    <input
                        type="text"
                        class="impression"
                        placeholder="例：かっこいい"
                    >

                    <label>
                        印象語 2
                    </label>

                    <input
                        type="text"
                        class="impression"
                        placeholder="例：おしゃれ"
                    >

                    <label>
                        印象語 3
                    </label>

                    <input
                        type="text"
                        class="impression"
                        placeholder="例：爽やか"
                    >

                `;


                questions.appendChild(
                    question
                );

            }
        );


        // ------------------------------------
        // 読み込み表示を消す
        // ------------------------------------

        loading.style.display =
            "none";


        // ------------------------------------
        // 送信ボタンを表示
        // ------------------------------------

        submitButton.style.display =
            "block";


    } catch (e) {

        console.error(
            "読み込みエラー:",
            e
        );


        loading.style.display =
            "none";


        error.textContent =
            "アンケートの読み込みに失敗しました。";


        error.textContent +=
            " ブラウザのコンソールを確認してください。";

    }

}


// ========================================
// 回答を送信
// ========================================

async function submitAnswers() {

    const questions =
        document.querySelectorAll(".question");


    const submitButton =
        document.getElementById("submitButton");


    const message =
        document.getElementById("message");


    const answers = [];


    let incomplete = false;


    // ------------------------------------
    // 入力内容を取得
    // ------------------------------------

    questions.forEach(question => {

        const image =
            question.dataset.image;


        const inputs =
            question.querySelectorAll(".impression");


        const impression1 =
            inputs[0].value.trim();


        const impression2 =
            inputs[1].value.trim();


        const impression3 =
            inputs[2].value.trim();


        // 未入力チェック
        if (
            impression1 === "" ||
            impression2 === "" ||
            impression3 === ""
        ) {

            incomplete = true;

        }


        answers.push({

            image:
                image,

            impression1:
                impression1,

            impression2:
                impression2,

            impression3:
                impression3

        });

    });


    // ------------------------------------
    // 未入力の場合
    // ------------------------------------

    if (incomplete) {

        alert(
            "すべての印象語を入力してください。"
        );

        return;

    }


    // ------------------------------------
    // 送信ボタンを無効化
    // ------------------------------------

    submitButton.disabled =
        true;


    submitButton.textContent =
        "送信中...";


    try {

        // ------------------------------------
        // Google Apps Scriptへ送信
        // ------------------------------------

        await fetch(
            GAS_URL,
            {
                method: "POST",

                mode: "no-cors",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    respondentId:
                        respondentId,

                    answers:
                        answers

                })

            }
        );


        // ------------------------------------
        // 送信内容を確認用に表示
        // ------------------------------------

        console.log(
            "送信データ:",
            {
                respondentId:
                    respondentId,

                answers:
                    answers
            }
        );


        // ------------------------------------
        // 完了表示
        // ------------------------------------

        message.textContent =
            "回答ありがとうございました。";


        alert(
            "回答を送信しました。"
        );


        // ------------------------------------
        // 二重送信防止
        // ------------------------------------

        submitButton.style.display =
            "none";


    } catch (e) {

        console.error(
            "送信エラー:",
            e
        );


        alert(
            "回答の送信に失敗しました。もう一度お試しください。"
        );


        submitButton.disabled =
            false;


        submitButton.textContent =
            "回答を送信";

    }

}


// ========================================
// 送信ボタン
// ========================================

document
    .getElementById("submitButton")
    .addEventListener(
        "click",
        submitAnswers
    );


// ========================================
// ページ読み込み
// ========================================

window.addEventListener(
    "load",
    createQuestions
);
