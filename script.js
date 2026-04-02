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
window.deleteComment = async function deleteComment(id) {
    if (!confirm("确定删除这条留言吗？")) return;

    try {
        // 关键：删除时必须同时匹配 id 和 user_id
        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

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
    // 确定当前的类别（shirt 或 board）
    const category = designName.includes('shirt') ? 'shirt' : 'board';
    
    // 查询当前用户在此类别投了多少票
    const { data: userVotes } = await supabaseClient
        .from('votes')
        .select('*')
        .eq('user_id', userId);
    
    // 统计用户在此类别中的投票数
    const categoryVotes = userVotes.filter(v => {
        const voteCategory = v.design.includes('shirt') ? 'shirt' : 'board';
        return voteCategory === category;
    }).length;
    
    if (categoryVotes >= 2) {
        if (category === 'shirt') {
            alert("您已在队衫设计中投了 2 票，不能再投了");
        } else {
            alert("您已在队牌设计中投了 2 票，不能再投了");
        }
        return;
    }
    
    // 检查是否已经给这个具体设计投过票
    const alreadyVoted = userVotes.some(v => v.design === designName);
    if (alreadyVoted) {
        alert("您已经给这个设计投过票了");
        return;
    }
    
    // 插入投票
    const { error } = await supabaseClient
        .from('votes')
        .insert([
            { design: designName, user_id: userId }
        ]);
    
    if (error) {
        alert("投票失败：" + error.message);
        return;
    }
    
    alert("投票成功！");
    
    // 更新当前页面的按钮状态
    const btn = document.querySelector(".vote-btn");
    if (btn) {
        const remainingVotes = 2 - (categoryVotes + 1);
        if (remainingVotes <= 0) {
            btn.disabled = true;
            btn.innerText = "已投满";
        } else {
            btn.disabled = false;
            btn.innerText = `投票支持 (还可投 ${remainingVotes} 票)`;
        }
    }
    
    loadVotes();
}

async function loadVotes() {
    const { data } = await supabaseClient
        .from('votes')
        .select('*');
    
    if (!data) return;
    
    // 确定当前类别
    const category = designName.includes('shirt') ? 'shirt' : 'board';
    
    // 获取当前类别的所有设计和投票统计
    const categoryVotes = data.filter(v => {
        const voteCategory = v.design.includes('shirt') ? 'shirt' : 'board';
        return voteCategory === category;
    });
    
    const totalCategoryVotes = categoryVotes.length;
    const currentVotes = categoryVotes.filter(v => v.design === designName).length;
    
    let percentage = 0;
    if (totalCategoryVotes > 0) {
        percentage = ((currentVotes / totalCategoryVotes) * 100).toFixed(1);
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
    
    // 检查用户在此类别还能投多少票
    const { data: userVotes } = await supabaseClient
        .from('votes')
        .select('*')
        .eq('user_id', userId);
    
    const userCategoryVotes = userVotes.filter(v => {
        const voteCategory = v.design.includes('shirt') ? 'shirt' : 'board';
        return voteCategory === category;
    });
    
    const remainingVotes = 2 - userCategoryVotes.length;
    const btn = document.querySelector(".vote-btn");
    
    if (btn) {
        if (remainingVotes <= 0) {
            btn.disabled = true;
            btn.innerText = "已投满";
        } else if (userVotes.some(v => v.design === designName)) {
            btn.disabled = true;
            btn.innerText = `已投票 (还可投 ${remainingVotes} 票)`;
        } else {
            btn.disabled = false;
            btn.innerText = `投票支持 (还可投 ${remainingVotes} 票)`;
        }
    }
}
window.addEventListener("DOMContentLoaded", () => {
    loadComments();
    loadVotes();
});
