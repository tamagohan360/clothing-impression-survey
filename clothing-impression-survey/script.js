// ========================================
// GitHubの設定
// ========================================

const GITHUB_USER = "tamagohan360";
const REPOSITORY = "clothing-impression-survey";
const IMAGE_FOLDER = "images";


// ========================================
// GitHub APIから画像一覧を取得
// ========================================

async function getImages() {

    const url =
        `https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/contents/${IMAGE_FOLDER}`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            "画像一覧を取得できませんでした"
        );

    }

    const files = await response.json();


    // 画像ファイルだけを抽出

    const imageFiles = files.filter(file => {

        return (
            file.type === "file" &&
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
        );

    });


    return imageFiles;

}


// ========================================
// 配列をシャッフル
// ========================================

function shuffle(array) {

    const result = [...array];

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
        ] = [
            result[j],
            result[i]
        ];

    }

    return result;

}


// ========================================
// ランダム5枚を表示
// ========================================

async function createQuestions() {

    const questions =
        document.getElementById("questions");

    try {

        // GitHubから画像一覧を取得

        const images =
            await getImages();


        if (images.length < 5) {

            throw new Error(
                "画像が5枚未満です"
            );

        }


        // ランダムに5枚選択

        const selectedImages =
            shuffle(images).slice(0, 5);


        // 5枚を表示

        selectedImages.forEach(
            (image, index) => {

                const question =
                    document.createElement("div");

                question.className =
                    "question";


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


                // 画像情報を保存

                question.dataset.image =
                    image.name;


                questions.appendChild(
                    question
                );

            }
        );


    } catch (error) {

        console.error(error);

        questions.innerHTML = `

            <p>
                画像を読み込めませんでした。
            </p>

            <p>
                ${error.message}
            </p>

        `;

    }

}


// ========================================
// ページ読み込み時に実行
// ========================================

window.onload = function() {

    createQuestions();

};
