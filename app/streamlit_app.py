import streamlit as st
import requests
import pandas as pd
import altair as alt
import uuid


API_URL = "http://localhost:8000"

# st.write("Current theme settings:", st.get_option("theme"))

st.set_page_config(page_title="Fitness AI Dashboard", layout="wide")
st.title("🏋️ Fitness AI Coach")

tab1, tab2, tab3, tab4 = st.tabs(["📊 Progress", "🧠 Weekly Report", "🎯 Set Goal", "📋 Data Logs"])

# ======================
# 📊 PROGRESS TAB
# ======================
with tab1:
    st.markdown("## ⚖️ Body Composition Progress")
    st.markdown("---")

    body = requests.get(f"{API_URL}/body-composition").json()
    goal = requests.get(f"{API_URL}/user/goal").json()

    if body:
        df_body = pd.DataFrame(body).sort_values("date")
        df_body["date"] = pd.to_datetime(df_body["date"])

        # Color scheme for chart lines
        custom_colors = {
            "Weight": "#4E9F3D",
            "Target Weight": "#FF4B4B",
            "Body Fat %": "#00BFFF",
            "Target Body Fat %": "#FFC300"
        }

        # Latest values for progress calc
        latest_weight = df_body["weight"].iloc[-1]
        start_weight = df_body["weight"].iloc[0] if len(df_body) > 1 else latest_weight
        goal_weight = goal.get("target_weight", None)

        # Goal progress bar
        if goal_weight:
            progress = abs((latest_weight - goal_weight) / (start_weight - goal_weight)) if (start_weight - goal_weight) != 0 else 0
            progress = min(max(progress, 0), 1)

            st.markdown("#### 🎯 Goal Progress")
            st.markdown(f"**Start:** {start_weight:.1f} lbs ➡️ **Goal:** {goal_weight:.1f} lbs")
            st.progress(progress)

        st.divider()
        col1, col2 = st.columns(2)

        # 📉 Weight Chart
        with col1:
            st.markdown("### 📉 Weight")
            df_weight = df_body[["date", "weight"]].copy()
            df_weight["metric"] = "Weight"

            if goal.get("target_weight"):
                df_goal_weight = pd.DataFrame({
                    "date": df_weight["date"],
                    "weight": [goal["target_weight"]] * len(df_weight),
                    "metric": ["Target Weight"] * len(df_weight)
                })
                df_weight = pd.concat([df_weight, df_goal_weight])

            chart = alt.Chart(df_weight).mark_line(
                interpolate='monotone', strokeWidth=3
            ).encode(
                x=alt.X("date:T", axis=alt.Axis(format="%b %d", tickCount="day")),
                y=alt.Y("weight:Q", title="Weight (lbs)"),
                color=alt.Color("metric:N", scale=alt.Scale(domain=list(custom_colors.keys()), range=list(custom_colors.values()))),
                tooltip=["date:T", "weight:Q", "metric:N"]
            )
            st.altair_chart(chart, use_container_width=True)

        # 💧 Body Fat % Chart
        with col2:
            st.markdown("### 💧 Body Fat %")
            df_bf = df_body[["date", "body_fat"]].copy()
            df_bf["metric"] = "Body Fat %"

            if goal.get("target_body_fat"):
                df_goal_bf = pd.DataFrame({
                    "date": df_bf["date"],
                    "body_fat": [goal["target_body_fat"]] * len(df_bf),
                    "metric": ["Target Body Fat %"] * len(df_bf)
                })
                df_bf = pd.concat([df_bf, df_goal_bf])

            chart = alt.Chart(df_bf).mark_line(
                interpolate='monotone', strokeWidth=3
            ).encode(
                x=alt.X("date:T", axis=alt.Axis(format="%b %d", tickCount="day")),
                y=alt.Y("body_fat:Q", title="Body Fat (%)"),
                color=alt.Color("metric:N", scale=alt.Scale(domain=list(custom_colors.keys()), range=list(custom_colors.values()))),
                tooltip=["date:T", "body_fat:Q", "metric:N"]
            )
            st.altair_chart(chart, use_container_width=True)

        st.divider()

        st.markdown("### 📋 Body Composition Table")
        st.dataframe(df_body.sort_values("date", ascending=False), use_container_width=True)

    else:
        st.info("No body composition data available.")

    st.divider()
    st.markdown("### 🧾 Current Goal")
    if "goal_type" in goal:
        st.success(f"""
        **Goal Type:** {goal['goal_type'].capitalize()}  
        **Target Weight:** {goal['target_weight']} lbs  
        **Target Body Fat:** {goal['target_body_fat']}%  
        **Timeframe:** {goal['timeframe_weeks']} weeks
        """)
    else:
        st.info("No goal set.")



# ======================
# 🧠 WEEKLY REPORT TAB
# ======================
import streamlit as st
import requests

with tab2:
    st.subheader("🧠 LLM-Generated Weekly Report")

    if "report_history" not in st.session_state:
        st.session_state.report_history = None
    if "report_prompt" not in st.session_state:
        st.session_state.report_prompt = None
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    if "show_chat" not in st.session_state:
        st.session_state.show_chat = False

    if st.button("📥 Generate New Report"):
        with st.spinner("Generating report using GPT..."):
            res = requests.get(f"{API_URL}/report")
            if "report" in res.json():
                st.session_state.report_history = res.json()["report"]
                st.session_state.report_prompt = res.json()["prompt"]
                st.session_state.chat_history = []
                st.session_state.show_chat = False
            else:
                st.error(res.json().get("error", "Failed to generate report"))

    if st.session_state.report_history:
        st.markdown("### 📋 Weekly Report")
        st.markdown(st.session_state.report_history)

        st.divider()

        # 💬 Toggleable Chat Interface
        st.markdown("### 💬 Chat with Your Coach")
        st.session_state.show_chat = st.toggle("Open Chat Window", value=st.session_state.show_chat)

        if st.session_state.show_chat:
            chat_box = st.container()

            # Display bubbles
            with chat_box:
                for entry in st.session_state.chat_history:
                    st.markdown(
                        f"""
                        <div style='background-color:#f0f0f5; padding:10px 15px; border-radius:10px; max-width:80%; margin-bottom:10px;'>
                            <strong>🧑 You:</strong><br>{entry['user']}
                        </div>
                        """,
                        unsafe_allow_html=True
                    )
                    st.markdown(
                        f"""
                        <div style='background-color:#dcecf8; padding:10px 15px; border-radius:10px; max-width:80%; margin-left:auto; margin-bottom:20px;'>
                            <strong>🧠 Coach:</strong><br>{entry['response']}
                        </div>
                        """,
                        unsafe_allow_html=True
                    )
           



# ======================
# 🎯 SET GOAL TAB
# ======================
with tab3:
    st.subheader("Set Your Goal")

    goal_type = st.selectbox("Goal Type", ["cut", "bulk", "recomp"])
    target_weight = st.number_input("Target Weight (lbs)", min_value=80.0, max_value=300.0, step=0.5)
    target_bf = st.number_input("Target Body Fat %", min_value=5.0, max_value=40.0, step=0.1)
    timeframe = st.slider("Timeframe (weeks)", 1, 24)

    if st.button("✅ Submit Goal"):
        payload = {
            "goal_type": goal_type,
            "target_weight": target_weight,
            "target_body_fat": target_bf,
            "timeframe_weeks": timeframe
        }
        res = requests.post(f"{API_URL}/user/goal", json=payload)
        if res.status_code == 200:
            st.success("Goal submitted!")
        else:
            st.error("Failed to submit goal.")

# ======================
# 📋 DATA LOGS TAB
# ======================
with tab4:
    # 🥗 NUTRITION
    st.subheader("🥗 Nutrition Log")
    nutrition = requests.get(f"{API_URL}/nutrition").json()
    if nutrition:
        df_nutrition = pd.DataFrame(nutrition).sort_values("date", ascending=False)
        st.dataframe(df_nutrition, use_container_width=True)
    else:
        st.info("No nutrition data available.")

    nutrition_file = st.file_uploader("Upload Nutrition CSV", type="csv", key="nutrition")
    if nutrition_file is not None:
        df = pd.read_csv(nutrition_file)
        st.dataframe(df)
        if st.button("Upload Nutrition Data"):
            records = df.to_dict(orient="records")
            res = requests.post(f"{API_URL}/nutrition", json=records)
            if res.status_code == 200:
                st.success(f"{len(records)} nutrition records uploaded!")
            else:
                st.error("Upload failed.")

    st.markdown("---")

    # ⚖️ BODY COMPOSITION
    st.subheader("⚖️ Body Composition Log")
    if body:
        df_body = pd.DataFrame(body).sort_values("date", ascending=False)
        st.dataframe(df_body, use_container_width=True)
    else:
        st.info("No body data available.")

    body_file = st.file_uploader("Upload Body Composition CSV", type="csv", key="body")
    if body_file is not None:
        df = pd.read_csv(body_file)
        st.dataframe(df)
        if st.button("Upload Body Data"):
            records = df.to_dict(orient="records")
            res = requests.post(f"{API_URL}/body-composition", json=records)
            if res.status_code == 200:
                st.success(f"{len(records)} body entries uploaded!")
            else:
                st.error("Upload failed.")

    st.markdown("---")

    # 💪 WORKOUTS
    st.subheader("💪 Workout Log")
    workouts = requests.get(f"{API_URL}/workout").json()
    if workouts:
        df_workout = pd.DataFrame(workouts).sort_values("date", ascending=False)
        st.dataframe(df_workout, use_container_width=True)
    else:
        st.info("No workout data available.")

    workout_file = st.file_uploader("Upload Workout CSV", type="csv", key="workout")
    if workout_file is not None:
        df = pd.read_csv(workout_file)
        st.dataframe(df)
        if st.button("Upload Workout Data"):
            records = df.to_dict(orient="records")
            res = requests.post(f"{API_URL}/workout", json=records)
            if res.status_code == 200:
                st.success(f"{len(records)} workouts uploaded!")
            else:
                st.error("Upload failed.")


# ========== STYLED SIDEBAR CHAT ASSISTANT ==========
st.sidebar.markdown("<h2 style='text-align:center;'>💬 Ask Your Coach</h2>", unsafe_allow_html=True)

# Initialize chat history and rerun flag
if "sidebar_chat_history" not in st.session_state:
    st.session_state.sidebar_chat_history = []
if "sidebar_chat_rerun" not in st.session_state:
    st.session_state.sidebar_chat_rerun = False

# Load state from latest report
has_report = st.session_state.get("report_history") and st.session_state.get("report_prompt")

if has_report:
    with st.sidebar.container():
        st.markdown("<div style='max-height:400px; overflow-y:auto;'>", unsafe_allow_html=True)

        for entry in st.session_state.sidebar_chat_history:
            # User message bubble
            st.markdown(
                f"""
                <div style='background-color:#f0f2f6; padding:10px 15px; border-radius:12px; margin-bottom:10px; max-width:100%;'>
                    <strong>🧑 You:</strong><br>{entry['user']}
                </div>
                """,
                unsafe_allow_html=True
            )

            # Coach response bubble
            st.markdown(
                f"""
                <div style='background-color:#d6f0e0; padding:10px 15px; border-radius:12px; margin-bottom:20px; margin-left:20px; max-width:100%;'>
                    <strong>🧠 Coach:</strong><br>{entry['response']}
                </div>
                """,
                unsafe_allow_html=True
            )

        st.markdown("</div>", unsafe_allow_html=True)

        # Use st.form and improved rerun solution
        with st.form("sidebar_chat_form", clear_on_submit=True):
            sidebar_question = st.text_input("Ask a question")
            submitted = st.form_submit_button("🧠 Ask Coach")

            if submitted and sidebar_question.strip():
                with st.spinner("Thinking..."):
                    payload = {
                        "report": st.session_state.report_history,
                        "prompt": st.session_state.report_prompt,
                        "question": sidebar_question
                    }
                    res = requests.post(f"{API_URL}/report/chat", json=payload)
                    if res.status_code == 200:
                        coach_response = res.json()["response"]
                        st.session_state.sidebar_chat_history.append({
                            "user": sidebar_question,
                            "response": coach_response
                        })
                        st.session_state.sidebar_chat_rerun = True
                    else:
                        st.error("Something went wrong.")

    # Trigger rerun using st.rerun() instead of query parameters
    if st.session_state.sidebar_chat_rerun:
        st.session_state.sidebar_chat_rerun = False
        st.rerun()  # This replaces the query parameter approach
else:
    st.sidebar.info("Generate a weekly report first to enable coaching chat.")



