import { formatDate, setupModalToggle, changeNum } from "/js/utils.js";

const postContainer = document.querySelector(".inner");

// main.js에서 클릭한 게시글의 post_id를 url에서 가져온다.
const postId = new URLSearchParams(window.location.search).get("post_id");
console.log(postId);
//  fetch로 json 파일 불러오기
fetch(`http://localhost:4000/posts/${postId}`)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    renderPost(data, postContainer);
    afterRender();
  });

function renderPost(postData, container) {
  container.innerHTML = `
    <div class="title">
      <h2>${postData.post_title}</h2>
      <div class="control">
        <div class="writer">
          <div class="img"><div style="background-image: url('${
            postData.profileImagePath
          }');"></div></div>
          <div class="name">${postData.nickname}</div>
          <div class="date">${formatDate(postData.created_at)}</div>
        </div>
        <div class="controlBtns">
          <button class="modi"><a href="./editpost.html">수정</a></button>
          <button class="del"><a href="#">삭제</a></button>
        </div>
      </div>
    </div>
    <div class="contents">
    <img class="img" src="${postData.attach_file_path}">

      <div class="texts">${postData.post_content}</div>
    </div>

    <div class="clickBtn">
      <button class="views">
        <p class="count">${changeNum(postData.hits)}</p>
        <p class="text">조회수</p>
      </button>
      <button class="comments">
        <p class="count">${changeNum(postData.like)}</p>
        <p class="text">좋아요</p>
      </button>
    </div>
    <div class="makeComment">
    <form method="post" class="comment-form">
      <div class="box">
        <textarea
          class="write-comment"
          name="comment"
          placeholder="댓글을 남겨주세요!"
          required
        ></textarea>
        <div class="btn"><button>댓글 등록</button></div>
      </div>
    </form>
  </div>
    <div class="commentsList">
    ${
      postData.comments && postData.comments.length > 0
        ? postData.comments
            .map(
              (comment) => `
      <div class="comments">
        <div class="left">
          <div class="top">
            <div class="img"><div style="background-image: url('${
              comment.profileImagePath
            }');"></div></div>
            <div class="name">${comment.nickname}</div>
            <div class="date">${formatDate(comment.created_at)}</div>
          </div>
          <div class="bottom">
            <div class="comment active">${comment.comment}</div>
          </div>
        </div>
        <div class="right click">
        <div class="controlBtns">
          <button class="modi">수정</button>
          <button class="del">삭제</button>
          </div>
        </div>
      </div>
    `
            )
            .join("")
        : ""
    }
  </div>
  `;
}

const afterRender = () => {
  // 게시글 수정 삭제 버튼
  const modiBtn = document.querySelector(".title .modi");
  const delBtn = document.querySelector(".title .del");
  // 게시글 삭제 버튼 클릭 시 모달 팝업
  const cancelBtn = document.querySelector(".modal .cancel");
  const confirmBtn = document.querySelector(".modal .delete");
  const bodyEl = document.querySelector("body");
  const modalPostEl = document.querySelector(".shadow-post");
  const modalCommentEl = document.querySelector(".shadow-comment");
  // 댓글 창
  const commentEl = document.querySelector(".write-comment"); // form textarea
  const commentBtn = document.querySelector(".inner .makeComment .btn button"); // 댓글 등록 버튼
  // const modiCoBtn = document.querySelector(".comments .modi");
  // const delCoBtn = document.querySelector(".comments .del");
  const modiCoBtns = document.querySelectorAll(".comments .modi");
  const delCoBtns = document.querySelectorAll(".comments .del");
  const cancelCoBtn = document.querySelector(".shadow-comment .cancel");
  const confirmCoBtn = document.querySelector(".shadow-comment .delete");
  const commentEditEl = document.querySelector(".comment.active");

  // 게시글 및 댓글 모달 이벤트 리스너 설정
  setupModalToggle(delBtn, modalPostEl, bodyEl);
  delCoBtns.forEach((btn) => {
    setupModalToggle(btn, modalCommentEl, bodyEl);
  });
  setupModalToggle(cancelBtn, modalPostEl, bodyEl);
  setupModalToggle(cancelCoBtn, modalCommentEl, bodyEl);
  setupModalToggle(confirmBtn, modalPostEl, bodyEl, "/main.html");
  setupModalToggle(confirmCoBtn, modalCommentEl, bodyEl);

  const commentForm = document.querySelector(".comment-form");

  commentForm.addEventListener("submit", async (event) => {
    fetch(`http://localhost:4000/posts/${postId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: commentEl.value,
        user_id: "583c5484cb79a5fe593425a9",
        nickname: "조용한낙타",
        profileImagePath:
          "https://i.pinimg.com/564x/3e/fc/6e/3efc6e820481b9125452a0bd93b56781.jpg",
        created_at: new Date(),
      }),
    });
    const data = await response.json();
    console.log(data);
    if (response.status === 201) {
      alert("댓글이 등록되었습니다.");
      location.reload();
    }
  });

  // 댓글 입력 시 버튼 색 변경
  commentEl.addEventListener("input", () => {
    if (commentEl.value.length > 0) {
      commentBtn.classList.add("active");
    } else {
      commentBtn.classList.remove("active");
    }
  });

  // 댓글 수정 버튼 클릭 시 댓글 입력창에 댓글 내용 추가되고 수정 버튼 value값은 댓글 수정으로 바뀐다.
  // 클릭된 commentsEl 요소 안에 댓글 내용 요소인 div 수정버튼(.modi) 클릭 시 .comments의 댓글내용인 .comments .comment의 내용을 가져와서 commentEl에 넣어준다.
  modiCoBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      console.log(commentEditEl.textContent);
      commentEl.value = commentEditEl.textContent;
      commentBtn.textContent = "댓글 수정";
      commentBtn.classList.add("modi");
      commentEl.focus();
    });
  });

  // 댓글 수정 버튼 클릭 시 댓글 수정 버튼이 댓글 등록 버튼으로 바뀐다.
  commentBtn.addEventListener("click", () => {
    if (commentBtn.classList.contains("modi")) {
      commentBtn.textContent = "댓글 등록";
      commentBtn.classList.remove("modi");
    }
  });
};