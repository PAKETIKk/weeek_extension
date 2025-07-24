function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
document.getElementById("report").addEventListener("click", () => {
    try{
        fetch("https://api.weeek.net/user/profile/me", {
            method: "GET",
            "credentials": "include"
        }).then(response => {
            if(!response.ok){
                document.getElementById("output").innerHTML = '<p>Ошибка: не авторизован</p>';
                return Promise.reject();
            }
            return response.json()
        }).then(data => {
            userId = data.user.id;
            currentDate = new Date();
            dd = String(currentDate.getDate()).padStart(2, '0');
            mm = String(currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
            yyyy = currentDate.getFullYear();
            currentDate = dd + '.' + mm + '.' + yyyy;
            fetch(`https://api.weeek.net/ws/533020/an/tasks/user/${userId}?startDay=${currentDate}&endDay=${currentDate}&groupBy=project`, {
                method: "GET",
                "credentials": "include"
            }).then(res => {
                return res.json();
            }).then(d => {
                console.log(d["data"]["info"]["groups"]);
                groups = d["data"]["info"]["groups"];
                let output_text = "";

                for (const group of groups) {
                    const group_title = group.title;
                    output_text += `<b>${group_title}:</b>\n`;

                    let i = 1; // Счётчик задач, начиная с 1
                    for (const task of group.tasks) {
                        const task_title = task.taskTitle;
                        const task_id = task.taskId;
                        const task_minutes = task.minutes;
                        const task_status = !task.taskCompleted ? "в работе" : "готово";

                        // Преобразуем минуты в часы и минуты
                        const hours = Math.floor(task_minutes / 60);
                        const minutes = task_minutes % 60;

                        // Форматируем строку с HTML-ссылкой
                        output_text += `<p>${i}. ${task_title} (https://app.weeek.net/ws/533020/task/${task_id}) - ${hours}:${String(minutes).padStart(2, '0')} - ${task_status}<\p>\n`;
                        i++;
                    }

                    output_text += "\n"; // Добавляем пустую строку между группами
                }
                // Для вывода или отладки:
                document.getElementById("output").innerHTML = output_text;
            });
        });
        //tasksUrl = `https://api.weeek.net/ws/533020/an/tasks/user/{userId}?startDay={current_date}&endDay={current_date}&groupBy=project`;
    }
    catch(e){
        document.getElementById("output").innerHTML = e.message;
    }
});