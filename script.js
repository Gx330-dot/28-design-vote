// 生成或获取当前用户ID
let userId = localStorage.getItem("user_id");

if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("user_id", userId);
}

const supabaseUrl = 'https://vhfzgnahhaaqvfsjrhux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZnpnbmFoaGFhcXZmc2pyaHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjQ0ODMsImV4cCI6MjA5MDU0MDQ4M30.1xH6IwmH4cB8xyV68DKVNhlgnq6zcFZdoBgXMcqaeUI';

//const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'Accept': 'application/json',
      // 增加这一行以确保跨域请求最顺畅
      'Access-Control-Allow-Origin': window.location.origin
    }
  }
});

// 修复后的删除评论函数
// 终极跨设备删除函数 —— 任何设备都能删自己的评论
window.deleteComment = async function deleteComment(id, userId_param) {
    if (!confirm("确定删除这条留言吗？")) return;

    try {
        // 使用传入的 userId_param 参数
        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', id)
            .eq('user_id', userId_param);  // 改为使用参数

        if (error) {
            alert("删除失败：" + error.message);
            console.error(error);
            return;
        }

        alert("删除成功！");
        loadComments();
    } catch (e) {
        alert("删除出错：" + e.message);
    }
};

const designName = window.designName;

async function loadComments() {
    const { data, error } = await supabaseClient
        .from('comments')
        .select('*')
        .eq('design', designName)
        .order('created_at', { ascending: false });

    const commentDiv = document.getElementById("comments");
    commentDiv.innerHTML = "";

if (data) {
    data.forEach(c => {

        let deleteButton = "";

	if (c.user_id === userId) {
    	// 把评论的 user_id 一起传给删除函数
    	deleteButton = `
        	<button onclick="deleteComment('${c.id}', '${c.user_id}')"
        	style="float:right;background: #E6E6FA;">
        	删除
        	</button>
    	`;
}

        commentDiv.innerHTML += `
            <div class="comment-card">
                <div class="comment-name">
                    ${c.name}
                    ${deleteButton}
                </div>
                <div>${c.message}</div>
            </div>
        `;
    });
}
}

async function submitComment() {
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;

    if (!name || !message) {
        alert("姓名和意见必须填写");
        return;
    }

    await supabaseClient.from('comments').insert([
        {
    		design: designName,
    		name: name,
    		message: message,
    		user_id: userId
	}
    ]);

    document.getElementById("message").value = "";
    loadComments();
}

function goBack() {
    window.location.href = window.parentPage;
}

function goBack1() {
    window.location.href = window.parentPage1;
}

async function vote(designName) {

    // 查询当前用户投了多少票
    const { data: userVotes } = await supabaseClient
        .from('votes')
        .select('*')
        .eq('user_id', userId);

    if (userVotes.length >= 2) {
        alert("每人最多只能投两票");
        return;
    }

    // 插入投票
    const { error } = await supabaseClient
        .from('votes')
        .insert([
            { design: designName, user_id: userId }
        ]);

    if (error) {
        alert("你已经给这个设计投过票了");
        return;
    }

	document.querySelector(".vote-btn").disabled = true;
	document.querySelector(".vote-btn").innerText = "已投票";

    loadVotes();
}

async function loadVotes() {

    const { data } = await supabaseClient
        .from('votes')
        .select('*');

    if (!data) return;

    const totalVotes = data.length;
    const currentVotes = data.filter(v => v.design === designName).length;

    let percentage = 0;
    if (totalVotes > 0) {
        percentage = ((currentVotes / totalVotes) * 100).toFixed(1);
    }

    const voteDiv = document.getElementById("voteResult");

    voteDiv.innerHTML = `
        <div class="vote-box">
            <div>票数：${currentVotes} 票 (${percentage}%)</div>
            <div class="vote-bar">
                <div class="vote-fill" style="width:${percentage}%"></div>
            </div>
        </div>
    `;

	const { data: userVotes } = await supabaseClient
    	.from('votes')
    	.select('*')
    	.eq('user_id', userId);

	if (userVotes.length >= 2) {
    	const btn = document.querySelector(".vote-btn");
    	if (btn) {
        btn.disabled = true;
        btn.innerText = "已投票";
    }
}
}

window.addEventListener("DOMContentLoaded", () => {
    loadComments();
    loadVotes();
});
