import { useEffect, useState } from "react";

import { fetchAuthSession } from "aws-amplify/auth";

import "./App.css";
import { SkillRetentionCosmos3D } from "./components/ThreeSkillCore";
import {
  validateSkillWithGemini,
  generatePracticeQuestionsWithGemini,
} from "./services/geminiService";







const API_URL =



  "https://vujdg9i4ob.execute-api.ap-southeast-2.amazonaws.com";





async function authorizedFetch(url, options = {}) {

  const session = await fetchAuthSession();

  const token = session.tokens?.accessToken?.toString();



  if (!token) {

    throw new Error("No Cognito access token found. Please sign in again.");

  }



  return fetch(url, {

    ...options,

    headers: {

      ...options.headers,

      Authorization: `Bearer ${token}`,

    },

  });

}





function App({
  userId,
  user,
  activePage: propActivePage,
  setActivePage: propSetActivePage,
  username: propUsername,
  onUpdateUsername,
}) {
  const [internalActivePage, setInternalActivePage] = useState("Dashboard");
  const activePage = propActivePage !== undefined ? propActivePage : internalActivePage;
  const setActivePage = propSetActivePage || setInternalActivePage;

  const [localUsername, setLocalUsername] = useState(() => {
    if (propUsername) return propUsername;
    const key = `skillretain_username_${userId || "default"}`;
    return localStorage.getItem(key) || user?.username || "Learner";
  });
  const currentUsername = propUsername || localUsername;
  const effectiveUserId = userId || user?.userId || user?.username || "";

  const [editingUsername, setEditingUsername] = useState(currentUsername);
  const [usernameSavedMsg, setUsernameSavedMsg] = useState("");

  const handleSaveUsername = (e) => {
    if (e) e.preventDefault();
    const trimmed = (editingUsername || "").trim();
    if (!trimmed) return;
    const key = `skillretain_username_${userId || "default"}`;
    localStorage.setItem(key, trimmed);
    setLocalUsername(trimmed);
    if (onUpdateUsername) {
      onUpdateUsername(trimmed);
    }
    setUsernameSavedMsg("Username saved successfully!");
    setTimeout(() => setUsernameSavedMsg(""), 3500);
  };



  const [showAddSkill, setShowAddSkill] = useState(false);



  const [searchText, setSearchText] = useState("");







  const [skills, setSkills] = useState([]);



  const [practiceHistory, setPracticeHistory] = useState([]);



  const [loadingSkills, setLoadingSkills] = useState(true);



  const [apiError, setApiError] = useState("");







  const [newSkill, setNewSkill] = useState({



    name: "",



    category: "",



    proficiency: "Beginner",



  });







  const [selectedSkill, setSelectedSkill] = useState(null);



  const [currentQuestion, setCurrentQuestion] = useState(0);



  const [answers, setAnswers] = useState([]);



  const [practiceStarted, setPracticeStarted] = useState(false);



  const [practiceFinished, setPracticeFinished] = useState(false);



  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceCorrectCount, setPracticeCorrectCount] = useState(0);

  // Gemini AI States
  const [isValidatingSkill, setIsValidatingSkill] = useState(false);
  const [geminiPopup, setGeminiPopup] = useState(null); // { type: 'error' | 'success', title: string, message: string }
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Auto-dismiss success notification
  useEffect(() => {
    if (geminiPopup && geminiPopup.type === "success") {
      const timer = setTimeout(() => {
        setGeminiPopup(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [geminiPopup]);







 useEffect(() => {
    if (!effectiveUserId) return;
    loadSkills();
    loadPracticeHistory();
  }, [effectiveUserId]);







  /* =========================



     LOAD DATA FROM AWS



  ========================= */







  async function loadSkills() {



    try {



      setLoadingSkills(true);



      setApiError("");







      const response = await authorizedFetch(



        `${API_URL}/skills?userId=${effectiveUserId}`



      );







      if (!response.ok) {



        throw new Error(`Failed to load skills (${response.status})`);



      }







      const data = await response.json();







      const awsSkills = Array.isArray(data)



        ? data



        : Array.isArray(data.skills)



          ? data.skills



          : [];







      setSkills(awsSkills.map(convertSkillFromApi));



    } catch (error) {



      console.error("Load skills error:", error);



      setApiError("Unable to connect to the AWS backend.");



    } finally {



      setLoadingSkills(false);



    }



  }







  async function loadPracticeHistory() {



    try {



      const response = await authorizedFetch(



        `${API_URL}/history?userId=${effectiveUserId}`



      );







      if (!response.ok) {



        throw new Error(`Failed to load history (${response.status})`);



      }







      const data = await response.json();







      const awsHistory = Array.isArray(data)



        ? data



        : Array.isArray(data.history)



          ? data.history



          : [];







      setPracticeHistory(



        awsHistory.map((entry) => ({



          id: entry.itemId || `${entry.skillId}-${entry.date}`,



          skillId: entry.skillId,



          skillName: entry.skillName || "Unknown Skill",



          category: entry.category || "",



          score: Number(entry.score || 0),



          total: Number(entry.total || 0),



          date: entry.date



            ? new Date(entry.date).toLocaleDateString()



            : "",



          time: entry.date



            ? new Date(entry.date).toLocaleTimeString([], {



              hour: "2-digit",



              minute: "2-digit",



            })



            : "",

          rawDate: entry.date || null,

        }))



      );



    } catch (error) {



      console.error("Load practice history error:", error);



    }



  }







  function convertSkillFromApi(skill) {



    return {



      id: skill.skillId,



      itemId: skill.itemId,



      userId: skill.userId,



      name: skill.name,



      category: skill.category,



      retention: Number(skill.retention ?? 0),



      proficiency: skill.proficiency || "Beginner",



      practices: Number(skill.practices || 0),



      lastPracticed: skill.lastPracticed



        ? new Date(skill.lastPracticed)



        : null,



      dependencies: skill.dependencies || [],



    };



  }







  /* =========================



     LEARNING RESOURCES



  ========================= */







  const resources = [



    {



      id: 1,



      skill: "Java",



      title: "Java Programming Tutorial",



      type: "Tutorial",



      description:



        "Review Java fundamentals, syntax and object-oriented programming.",



      url: "https://docs.oracle.com/javase/tutorial/",



    },



    {



      id: 2,



      skill: "Data Structures",



      title: "Data Structures and Algorithms",



      type: "Course",



      description:



        "Review arrays, linked lists, stacks, queues, trees and algorithms.",



      url: "https://www.geeksforgeeks.org/data-structures/",



    },



    {



      id: 3,



      skill: "DBMS",



      title: "Database Management Systems",



      type: "Tutorial",



      description:



        "Revise relational databases, SQL, normalization and transactions.",



      url: "https://www.geeksforgeeks.org/dbms/",



    },



    {



      id: 4,



      skill: "Recursion",



      title: "Introduction to Recursion",



      type: "Tutorial",



      description:



        "Strengthen recursion concepts with examples and practice problems.",



      url: "https://www.geeksforgeeks.org/recursion/",



    },



    {



      id: 5,



      skill: "Python",



      title: "Python Official Tutorial",



      type: "Tutorial",



      description:



        "Review Python syntax, data types, functions and core concepts.",



      url: "https://docs.python.org/3/tutorial/",



    },



  ];







  /* =========================

     SKILL-SPECIFIC PRACTICE QUESTIONS

  ========================= */



  const questionBank = {
    java: [
      { question: "Which keyword declares a class?", options: ["function", "class", "struct", "object"], answer: "class" },
      { question: "Which method is the usual Java entry point?", options: ["start()", "run()", "main()", "init()"], answer: "main()" },
      { question: "Which keyword creates an object?", options: ["this", "new", "create", "object"], answer: "new" },
      { question: "Which type stores true or false?", options: ["int", "String", "boolean", "char"], answer: "boolean" },
      { question: "Which symbol ends most Java statements?", options: [":", ";", " ,", "."], answer: ";" },
      { question: "Which access modifier allows access from anywhere?", options: ["private", "protected", "public", "default"], answer: "public" },
      { question: "Which keyword inherits a class?", options: ["implements", "extends", "inherits", "super"], answer: "extends" },
      { question: "Which keyword refers to the current object?", options: ["self", "this", "current", "object"], answer: "this" },
      { question: "Which collection stores unique elements?", options: ["ArrayList", "HashSet", "LinkedList", "Vector"], answer: "HashSet" },
      { question: "Which interface is commonly used to define a task for a thread?", options: ["Runnable", "Serializable", "Comparable", "Cloneable"], answer: "Runnable" },
      { question: "Which block handles an exception?", options: ["try", "final", "throwing", "catching"], answer: "try" },
      { question: "Which keyword prevents a method from being overridden?", options: ["static", "final", "const", "fixed"], answer: "final" },
      { question: "Which type is used for a single 16-bit Unicode character?", options: ["byte", "char", "boolean", "float"], answer: "char" },
      { question: "Which operator checks equality of primitive values?", options: ["=", "==", "===", "equals="], answer: "==" },
      { question: "Which keyword calls a superclass constructor?", options: ["this", "base", "super", "parent"], answer: "super" },
      { question: "Which structure repeats while a condition is true?", options: ["if", "switch", "while", "case"], answer: "while" },
      { question: "Which method compares String contents?", options: ["==", "compare", "equals()", "same()"], answer: "equals()" },
      { question: "What is the default value of an instance int field?", options: ["-1", "0", "null", "undefined"], answer: "0" },
      { question: "Which keyword declares a constant-like variable?", options: ["const", "final", "fixed", "staticconst"], answer: "final" },
      { question: "Which package contains the Scanner class?", options: ["java.io", "java.util", "java.net", "java.lang.reflect"], answer: "java.util" },
    ],
    python: [
      { question: "Which symbol starts a Python comment?", options: ["//", "#", "/*", "--"], answer: "#" },
      { question: "Which type stores True or False?", options: ["int", "str", "bool", "list"], answer: "bool" },
      { question: "Which keyword defines a function?", options: ["function", "func", "def", "method"], answer: "def" },
      { question: "Which brackets create a list?", options: ["{}", "()", "[]", "<>"], answer: "[]" },
      { question: "Which built-in function displays output?", options: ["echo()", "print()", "write()", "show()"], answer: "print()" },
      { question: "Which keyword starts a conditional branch?", options: ["when", "if", "check", "case"], answer: "if" },
      { question: "Which operator performs exponentiation?", options: ["^", "**", "//", "%%"], answer: "**" },
      { question: "Which value represents no value?", options: ["0", "False", "None", "null"], answer: "None" },
      { question: "Which method adds one item to a list?", options: ["push()", "append()", "addEnd()", "insertLast()"], answer: "append()" },
      { question: "Which keyword loops over items in a sequence?", options: ["foreach", "for", "loop", "repeat"], answer: "for" },
      { question: "Which function returns the length of a sequence?", options: ["size()", "count()", "len()", "length()"], answer: "len()" },
      { question: "Which collection stores key-value pairs?", options: ["tuple", "set", "dictionary", "string"], answer: "dictionary" },
      { question: "Which keyword handles an exception?", options: ["catch", "except", "error", "handle"], answer: "except" },
      { question: "Which keyword imports a module?", options: ["include", "using", "import", "require"], answer: "import" },
      { question: "Which operator tests membership?", options: ["in", "has", "within", "contains"], answer: "in" },
      { question: "Which data type is immutable?", options: ["list", "dictionary", "set", "tuple"], answer: "tuple" },
      { question: "What does range(3) produce as values?", options: ["1,2,3", "0,1,2", "0,1,2,3", "3 only"], answer: "0,1,2" },
      { question: "Which method converts text to uppercase?", options: ["upper()", "capitalizeAll()", "uppercase()", "toUpper()"], answer: "upper()" },
      { question: "Which keyword creates an anonymous function?", options: ["lambda", "anon", "def", "func"], answer: "lambda" },
      { question: "Which block runs whether or not an exception occurs?", options: ["except", "finally", "else", "raise"], answer: "finally" },
    ],
    "data structures": [
      { question: "Which data structure follows LIFO?", options: ["Queue", "Array", "Stack", "Linked List"], answer: "Stack" },
      { question: "Which data structure follows FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: "Queue" },
      { question: "Which structure uses nodes linked by references?", options: ["Array", "Linked List", "Matrix", "Heap file"], answer: "Linked List" },
      { question: "Which traversal visits left, root, right in a binary tree?", options: ["Preorder", "Inorder", "Postorder", "Level order"], answer: "Inorder" },
      { question: "Which structure is commonly used for BFS?", options: ["Stack", "Queue", "Heap", "Hash table"], answer: "Queue" },
      { question: "Which structure is commonly used for DFS?", options: ["Queue", "Stack", "Sorted array only", "Trie only"], answer: "Stack" },
      { question: "What is the average lookup time in a hash table?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], answer: "O(1)" },
      { question: "Which data structure efficiently returns the highest-priority item?", options: ["Queue", "Heap", "Linked list", "Graph"], answer: "Heap" },
      { question: "Which structure models vertices and edges?", options: ["Tree only", "Graph", "Stack", "Array"], answer: "Graph" },
      { question: "Which binary search tree traversal produces sorted order?", options: ["Preorder", "Inorder", "Postorder", "Reverse level order"], answer: "Inorder" },
      { question: "What is the time complexity of binary search on sorted data?", options: ["O(n)", "O(log n)", "O(n²)", "O(1) always"], answer: "O(log n)" },
      { question: "Which structure is suited to function-call tracking?", options: ["Stack", "Queue", "Graph", "Hash set"], answer: "Stack" },
      { question: "Which structure stores items by index contiguously?", options: ["Array", "Graph", "Tree", "Queue only"], answer: "Array" },
      { question: "What is a leaf node in a tree?", options: ["Node with no children", "Root node only", "Node with two parents", "Node with a cycle"], answer: "Node with no children" },
      { question: "Which structure is often used for autocomplete prefixes?", options: ["Trie", "Stack", "Queue", "Heap"], answer: "Trie" },
      { question: "Which sorting algorithm repeatedly selects the minimum remaining item?", options: ["Merge sort", "Selection sort", "Quick sort", "Heap sort"], answer: "Selection sort" },
      { question: "Which sorting algorithm divides data and merges sorted halves?", options: ["Bubble sort", "Merge sort", "Selection sort", "Counting only"], answer: "Merge sort" },
      { question: "What is a collision in hashing?", options: ["Two keys map to the same slot", "A tree has no root", "A queue becomes empty", "A stack overflows only"], answer: "Two keys map to the same slot" },
      { question: "Which graph traversal explores level by level?", options: ["DFS", "BFS", "Inorder", "Postorder"], answer: "BFS" },
      { question: "What is the worst-case search time in an unsorted linked list?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: "O(n)" },
    ],
    dbms: [
      { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "System Query Logic", "Structured Question Language"], answer: "Structured Query Language" },
      { question: "Which command retrieves rows from a table?", options: ["GET", "SELECT", "FETCHALL", "OPEN"], answer: "SELECT" },
      { question: "What is a primary key used for?", options: ["Duplicate rows", "Identify each row uniquely", "Delete a database", "Sort every column"], answer: "Identify each row uniquely" },
      { question: "Which command adds new rows?", options: ["INSERT", "ALTER", "GRANT", "SELECT"], answer: "INSERT" },
      { question: "Which command changes existing rows?", options: ["UPDATE", "CREATE", "DROP", "DESCRIBE"], answer: "UPDATE" },
      { question: "Which command removes selected rows?", options: ["DELETE", "REMOVE TABLE", "CLEAR SCHEMA", "ERASE"], answer: "DELETE" },
      { question: "What does a foreign key reference?", options: ["A row in another or the same table", "A database password", "An index file only", "A query plan"], answer: "A row in another or the same table" },
      { question: "Which clause filters rows before grouping?", options: ["ORDER BY", "WHERE", "HAVING", "SELECT"], answer: "WHERE" },
      { question: "Which clause filters grouped results?", options: ["WHERE", "HAVING", "FROM", "VALUES"], answer: "HAVING" },
      { question: "Which SQL function counts rows?", options: ["SUM()", "COUNT()", "TOTALROWS()", "SIZE()"], answer: "COUNT()" },
      { question: "What does normalization primarily reduce?", options: ["Data redundancy and anomalies", "Query syntax", "Number of users", "All indexes"], answer: "Data redundancy and anomalies" },
      { question: "Which ACID property means all-or-nothing?", options: ["Consistency", "Isolation", "Atomicity", "Durability"], answer: "Atomicity" },
      { question: "Which ACID property preserves committed changes?", options: ["Durability", "Atomicity", "Isolation", "Consistency"], answer: "Durability" },
      { question: "Which join returns only matching rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "FULL OUTER JOIN"], answer: "INNER JOIN" },
      { question: "Which command defines a table structure?", options: ["CREATE TABLE", "SELECT TABLE", "INSERT TABLE", "SHOW ROW"], answer: "CREATE TABLE" },
      { question: "Which constraint prevents duplicate values in a column or column set?", options: ["UNIQUE", "DEFAULT", "CHECK only", "NULL"], answer: "UNIQUE" },
      { question: "Which clause sorts query results?", options: ["GROUP BY", "ORDER BY", "SORT", "ARRANGE"], answer: "ORDER BY" },
      { question: "Which command makes a transaction's changes permanent?", options: ["COMMIT", "ROLLBACK", "SAVEPOINT", "DENY"], answer: "COMMIT" },
      { question: "Which command undoes uncommitted transaction changes?", options: ["COMMIT", "ROLLBACK", "GRANT", "UPDATE"], answer: "ROLLBACK" },
      { question: "What is an index mainly used for?", options: ["Speeding up data retrieval", "Encrypting all rows", "Replacing primary keys always", "Preventing all updates"], answer: "Speeding up data retrieval" },
    ],
    recursion: [
      { question: "What is recursion?", options: ["A function calling itself", "A loop that never ends", "Sorting an array", "Creating a class"], answer: "A function calling itself" },
      { question: "Why is a base case needed?", options: ["To increase memory", "To stop recursive calls", "To sort data", "To create a loop"], answer: "To stop recursive calls" },
      { question: "Which problem is commonly solved recursively?", options: ["Factorial calculation", "Declaring a variable", "Reading a comment", "Opening a file only"], answer: "Factorial calculation" },
      { question: "What is the recursive case?", options: ["The part that reduces the problem and calls again", "The stopping condition", "A syntax error", "The return type only"], answer: "The part that reduces the problem and calls again" },
      { question: "What happens without a reachable base case?", options: ["Calls may continue until stack overflow", "The program always sorts", "The function runs once", "Memory use becomes zero"], answer: "Calls may continue until stack overflow" },
      { question: "What is factorial of 0?", options: ["0", "1", "Undefined in all contexts", "-1"], answer: "1" },
      { question: "Which is a valid recursive factorial relation for n > 0?", options: ["n! = n + (n-1)!", "n! = n × (n-1)!", "n! = n / (n-1)!", "n! = n - 1"], answer: "n! = n × (n-1)!" },
      { question: "Which data structure commonly stores recursive calls?", options: ["Call stack", "Queue only", "Hash table only", "Graph adjacency list"], answer: "Call stack" },
      { question: "What is the base case for factorial?", options: ["factorial(0) = 1", "factorial(n) = n × factorial(n)", "factorial(1) calls itself", "n always increases"], answer: "factorial(0) = 1" },
      { question: "Which problem naturally uses divide and conquer recursion?", options: ["Merge sort", "Linear scan only", "Printing one constant", "Variable declaration"], answer: "Merge sort" },
      { question: "What does a recursive function need to make progress?", options: ["A smaller or simpler subproblem", "An infinite loop", "A global variable only", "No return path"], answer: "A smaller or simpler subproblem" },
      { question: "What is direct recursion?", options: ["A function calls itself", "Two functions call each other", "A loop calls a function", "A function calls main only"], answer: "A function calls itself" },
      { question: "What is mutual recursion?", options: ["Two or more functions call one another", "A function calls itself once", "A loop calls itself", "A variable references itself"], answer: "Two or more functions call one another" },
      { question: "What is a common disadvantage of recursion?", options: ["Call-stack overhead", "It cannot return values", "It cannot solve mathematical problems", "It always uses less memory"], answer: "Call-stack overhead" },
      { question: "What is the Fibonacci recurrence for n > 1?", options: ["F(n)=F(n-1)+F(n-2)", "F(n)=n×n", "F(n)=F(n-1)-1", "F(n)=2n always"], answer: "F(n)=F(n-1)+F(n-2)" },
      { question: "Which technique can avoid repeated Fibonacci calculations?", options: ["Memoization", "Randomization", "Busy waiting", "String concatenation only"], answer: "Memoization" },
      { question: "What is tail recursion?", options: ["Recursive call is the final operation", "Base case is missing", "Function calls two functions", "Recursion is inside a loop only"], answer: "Recursive call is the final operation" },
      { question: "How many times is factorial(3) called including factorial(0) in a simple recursive implementation?", options: ["2", "3", "4", "6"], answer: "4" },
      { question: "What should each recursive call ideally do toward termination?", options: ["Move closer to a base case", "Increase the input forever", "Reset the stack", "Skip all return statements"], answer: "Move closer to a base case" },
      { question: "What does stack overflow indicate in recursion?", options: ["Call stack capacity was exceeded", "Base case returned normally", "A query was optimized", "A list is empty"], answer: "Call stack capacity was exceeded" },
    ],
  };

  const defaultQuestions = [
      { question: "What is the main purpose of practising a skill?", options: ["Improve understanding", "Delete knowledge", "Avoid learning", "Remove progress"], answer: "Improve understanding" },
      { question: "What does debugging help you do?", options: ["Find and fix errors", "Delete all code", "Increase errors", "Rename every file"], answer: "Find and fix errors" },
      { question: "Why revise a skill regularly?", options: ["Improve retention", "Forget concepts", "Avoid practice", "Remove knowledge"], answer: "Improve retention" },
      { question: "What should you do when an answer is incorrect?", options: ["Review the concept", "Ignore the result", "Delete the skill", "Stop learning"], answer: "Review the concept" },
      { question: "What does a score of 15 out of 20 represent?", options: ["75%", "15%", "20%", "85%"], answer: "75%" },
      { question: "Which habit supports long-term learning?", options: ["Spaced practice", "Never revising", "Cramming once only", "Avoiding feedback"], answer: "Spaced practice" },
      { question: "What is feedback useful for?", options: ["Identifying improvement areas", "Hiding mistakes", "Removing progress", "Replacing practice"], answer: "Identifying improvement areas" },
      { question: "What is a learning objective?", options: ["A clear target for learning", "A random guess", "A database error", "A score only"], answer: "A clear target for learning" },
      { question: "Why track practice history?", options: ["To monitor progress over time", "To erase previous attempts", "To prevent revision", "To hide scores"], answer: "To monitor progress over time" },
      { question: "What does a percentage score measure?", options: ["Correct answers as a proportion of total", "Time only", "Number of skills", "Difficulty only"], answer: "Correct answers as a proportion of total" },
      { question: "If 10 of 20 answers are correct, what is the score?", options: ["25%", "50%", "75%", "100%"], answer: "50%" },
      { question: "What is the best response to a weak result?", options: ["Review and practise again", "Give up permanently", "Delete all records", "Ignore every mistake"], answer: "Review and practise again" },
      { question: "Why use questions during revision?", options: ["To check understanding actively", "To avoid recalling information", "To replace all study", "To guarantee full marks"], answer: "To check understanding actively" },
      { question: "What does consistency mean in learning?", options: ["Practising regularly", "Studying once and stopping", "Changing goals every minute", "Avoiding review"], answer: "Practising regularly" },
      { question: "What can a progress record show?", options: ["Changes in performance", "Only the user's password", "Nothing useful", "All future results exactly"], answer: "Changes in performance" },
      { question: "Which is a useful way to prepare for a quiz?", options: ["Review relevant concepts", "Choose answers randomly", "Skip the topic", "Close the app"], answer: "Review relevant concepts" },
      { question: "What does a 20-question session provide compared with a 3-question session?", options: ["A broader check of understanding", "Guaranteed perfect accuracy", "No need to study", "No scoring"], answer: "A broader check of understanding" },
      { question: "Why should questions match the selected skill?", options: ["To assess relevant knowledge", "To make scoring impossible", "To hide the topic", "To prevent learning"], answer: "To assess relevant knowledge" },
      { question: "What is self-assessment?", options: ["Checking your own understanding", "Deleting a record", "Changing a password", "Adding a database table"], answer: "Checking your own understanding" },
      { question: "What is the purpose of setting a learning goal?", options: ["Give practice a clear direction", "Prevent all mistakes", "Guarantee a perfect score", "Avoid tracking progress"], answer: "Give practice a clear direction" },
  ];

  function getQuestionsForSkill(skill) {

    if (!skill) return defaultQuestions;

    const name = (skill.name || "").trim().toLowerCase();

    const category = (skill.category || "").trim().toLowerCase();

    if (questionBank[name]) return questionBank[name];

    if (questionBank[category]) return questionBank[category];

    return defaultQuestions;

  }



  const questions =
    practiceQuestions && practiceQuestions.length > 0
      ? practiceQuestions
      : getQuestionsForSkill(selectedSkill);



  const navItems = [
    { name: "Dashboard", label: "Dashboard", icon: "⌂" },
    { name: "My Skills", label: "My Skills", icon: "▣" },
    { name: "Practice", label: "Practice Skills", icon: "✓" },
    { name: "Recommendations", label: "Recommendations", icon: "✦" },
    { name: "History", label: "History", icon: "◷" },
    { name: "Profile", label: "Profile", icon: "♙" },
  ];







  /* =========================



     RETENTION ENGINE



  ========================= */







  function calculateRetention(skill) {



    if (!skill.lastPracticed) {



      return Math.round(



        Math.max(0, Math.min(100, skill.retention))



      );



    }







    const lastPracticeTime = new Date(skill.lastPracticed);







    if (Number.isNaN(lastPracticeTime.getTime())) {



      return Math.round(



        Math.max(0, Math.min(100, skill.retention))



      );



    }







    const daysSincePractice =



      (Date.now() - lastPracticeTime.getTime()) /



      (1000 * 60 * 60 * 24);







    let decayRate = 3;







    if (skill.proficiency === "Beginner") {



      decayRate = 4;



    } else if (skill.proficiency === "Intermediate") {



      decayRate = 3;



    } else if (skill.proficiency === "Advanced") {



      decayRate = 2;



    }







    const retentionAfterDecay =



      skill.retention - daysSincePractice * decayRate;







    return Math.max(



      0,



      Math.min(100, Math.round(retentionAfterDecay))



    );



  }







  function getUpdatedSkill(skill) {



    return {



      ...skill,



      retention: calculateRetention(skill),



    };



  }







  const updatedSkills = skills.map(getUpdatedSkill);







  /* =========================



     PERSONALIZED PRIORITY ENGINE



  ========================= */







  function getDaysSincePractice(skill) {



    if (!skill.lastPracticed) {



      return 0;



    }







    const lastDate = new Date(skill.lastPracticed);







    if (Number.isNaN(lastDate.getTime())) {



      return 0;



    }







    return Math.max(



      0,



      (Date.now() - lastDate.getTime()) /



      (1000 * 60 * 60 * 24)



    );



  }







  function calculatePriority(skill) {



    let priority = 100 - skill.retention;







    // Extra priority for skills not practised recently.



    const daysSince = getDaysSincePractice(skill);



    priority += Math.min(daysSince * 2, 30);







    // Beginners may need more frequent revision.



    if (skill.proficiency === "Beginner") {



      priority += 5;



    }







    // Increase priority when a dependency has low retention.



    if (skill.dependencies?.length > 0) {



      skill.dependencies.forEach((dependencyId) => {



        const dependency = updatedSkills.find(



          (item) => item.id === dependencyId



        );







        if (dependency && dependency.retention < 70) {



          priority += 15;



        }



      });



    }







    return Math.round(priority);



  }







  function getPriorityLevel(priority) {



    if (priority >= 60) return "High";



    if (priority >= 30) return "Medium";



    return "Low";



  }







  function getResourceForSkill(skillName) {



    return (



      resources.find(



        (item) =>



          item.skill.toLowerCase() === skillName.toLowerCase()



      ) || null



    );



  }







  const weakSkills = updatedSkills.filter(



    (skill) => skill.retention < 70



  );







  const filteredSkills = updatedSkills.filter((skill) =>



    skill.name.toLowerCase().includes(searchText.toLowerCase())



  );







  /* =========================



     SKILL MANAGEMENT



  ========================= */







  async function addSkill() {
    const trimmedName = (newSkill.name || "").trim();
    const trimmedCategory = (newSkill.category || "").trim();

    if (!trimmedName || !trimmedCategory) {
      setGeminiPopup({
        type: "error",
        title: "Information Required",
        message: "Please enter both a skill name and a category.",
      });
      return;
    }

    try {
      setIsValidatingSkill(true);
      setApiError("");

      // 1. Verify with Gemini AI whether a legitimate skill was entered or nonsense
      const validation = await validateSkillWithGemini({
        name: trimmedName,
        category: trimmedCategory,
      });

      if (!validation.isValid) {
        setIsValidatingSkill(false);
        // Error popup if nonsense is entered
        setGeminiPopup({
          type: "error",
          title: "Invalid Skill Input",
          message:
            validation.message ||
            "The entered text appears to be nonsense or gibberish. Please enter a valid, recognized skill or topic.",
        });
        return;
      }

      // 2. Add skill to backend once verified as legitimate
      const response = await authorizedFetch(`${API_URL}/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          name: trimmedName,
          category: trimmedCategory,
          retention: 50,
          proficiency: newSkill.proficiency,
          dependencies: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add skill");
      }

      const createdSkill = convertSkillFromApi(
        data.skill || data
      );

      setSkills((previousSkills) => [
        ...previousSkills,
        createdSkill,
      ]);

      setNewSkill({
        name: "",
        category: "",
        proficiency: "Beginner",
      });

      setShowAddSkill(false);

      // Success message popup: "Skill added"
      setGeminiPopup({
        type: "success",
        title: "Skill Added",
        message: `"${trimmedName}" skill added successfully!`,
      });

      await loadSkills();
    } catch (error) {
      console.error("Add skill error:", error);
      setApiError("Unable to add the skill to AWS.");
      setGeminiPopup({
        type: "error",
        title: "Unable to Add Skill",
        message: error.message || "Unable to add the skill to AWS. Please check your connection and try again.",
      });
    } finally {
      setIsValidatingSkill(false);
    }
  }







  async function deleteSkill(id) {
    try {
      setApiError("");

      const response = await authorizedFetch(
        `${API_URL}/skills/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `Failed to delete skill (${response.status})`
        );
      }

      await loadSkills();
      await loadPracticeHistory();
    } catch (error) {
      console.error("Delete skill error:", error);
      setApiError(error.message || "Unable to delete the skill from AWS.");
    }
  }


  /* =========================



     PRACTICE SESSION



  ========================= */







  async function startPractice(skill) {
    if (!skill) return;
    setSelectedSkill(skill);
    setCurrentQuestion(0);
    setAnswers([]);
    setPracticeScore(0);
    setPracticeCorrectCount(0);
    setPracticeFinished(false);
    setPracticeStarted(true);
    setActivePage("Practice");
    setIsGeneratingQuestions(true);
    setPracticeQuestions([]);

    try {
      // Generate 20 randomized questions specifically tailored to this skill and proficiency level
      const generated = await generatePracticeQuestionsWithGemini({
        skillName: skill.name,
        category: skill.category,
        proficiency: skill.proficiency || "Beginner",
        count: 20,
      });

      if (generated && generated.length > 0) {
        if (generated.length < 20) {
          const fallback = getQuestionsForSkill(skill);
          const combined = [...generated, ...fallback].slice(0, 20);
          setPracticeQuestions(combined);
        } else {
          setPracticeQuestions(generated.slice(0, 20));
        }
      } else {
        setPracticeQuestions(getQuestionsForSkill(skill));
      }
    } catch (err) {
      console.warn("Could not generate AI questions, using fallback question bank:", err);
      setPracticeQuestions(getQuestionsForSkill(skill));
    } finally {
      setIsGeneratingQuestions(false);
    }
  }







  function selectAnswer(answer) {
    if (answers[currentQuestion] !== undefined) return;
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    setAnswers(updatedAnswers);
  }







  function nextQuestion() {



    if (currentQuestion < questions.length - 1) {



      setCurrentQuestion(currentQuestion + 1);



    } else {



      finishPractice();



    }



  }







  async function finishPractice() {



    let score = 0;







    questions.forEach((question, index) => {



      if (answers[index] === question.answer) {



        score++;



      }



    });







    const percentage = Math.round(
      (score / questions.length) * 100
    );

    setPracticeScore(percentage);
    setPracticeCorrectCount(score);







    const practiceDate = new Date().toISOString();







    try {



      setApiError("");







      const response = await authorizedFetch(`${API_URL}/practice`, {



        method: "POST",



        headers: {



          "Content-Type": "application/json",



        },



        body: JSON.stringify({



          userId: userId,



          skillId: selectedSkill.id,



          score,



          total: questions.length,



          date: practiceDate,



        }),



      });







      const data = await response.json();







      if (!response.ok) {



        throw new Error(data.error || "Failed to save practice");



      }







      await loadSkills();



      await loadPracticeHistory();







      setPracticeFinished(true);



    } catch (error) {



      console.error("Practice save error:", error);



      setApiError("Practice could not be saved to AWS.");



      setPracticeFinished(true);



    }



  }







  function resetPractice() {
    setSelectedSkill(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setPracticeStarted(false);
    setPracticeFinished(false);
    setPracticeScore(0);
    setPracticeCorrectCount(0);
    setPracticeQuestions([]);
    setIsGeneratingQuestions(false);

    loadSkills();



    loadPracticeHistory();



  }







  /* =========================



     DASHBOARD



  ========================= */







  function renderDashboard() {
    const averageRetention = updatedSkills.length > 0
      ? Math.round(updatedSkills.reduce((total, skill) => total + skill.retention, 0) / updatedSkills.length)
      : 0;

    const mostWeakSkill = [...updatedSkills].sort(
      (a, b) => calculatePriority(b) - calculatePriority(a)
    )[0];

    const today = new Date();
    const activityDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(today.getDate() - (6 - index));
      const dayKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const sessions = practiceHistory.filter((entry) => {
        if (!entry.rawDate) return false;
        const entryDate = new Date(entry.rawDate);
        if (Number.isNaN(entryDate.getTime())) return false;
        return `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}` === dayKey;
      }).length;
      return {
        key: dayKey,
        label: day.toLocaleDateString([], { weekday: "short" }),
        dateLabel: day.toLocaleDateString([], { day: "numeric", month: "short" }),
        sessions,
      };
    });
    const maxSessions = Math.max(1, ...activityDays.map((day) => day.sessions));
    
    return (
      <div className="page-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">SKILL RETENTION SYSTEM</p>
            <h1>Welcome back, {currentUsername}. Keep your skills fresh.</h1>
            <p>Your retention is monitored based on practice, proficiency and time.</p>
          </div>
          <button className="primary-button" onClick={() => setShowAddSkill(true)}>+ Add Skill</button>
        </section>

        {apiError && (
          <div style={{ padding: "12px 16px", marginBottom: "20px", background: "#fff3f3", border: "1px solid #f0caca", borderRadius: "8px", color: "#b42318" }}>
            {apiError}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card"><span>Total Skills</span><strong>{updatedSkills.length}</strong><small>Skills currently being tracked</small></div>
          <div className="stat-card"><span>Average Retention</span><strong>{averageRetention}%</strong><small>Based on current retention levels</small></div>
          <div className="stat-card"><span>Needs Practice</span><strong>{weakSkills.length}</strong><small>Skills below 70% retention</small></div>
          <div className="stat-card"><span>Practice Sessions</span><strong>{updatedSkills.reduce((total, skill) => total + skill.practices, 0)}</strong><small>Total recorded sessions</small></div>
        </section>

        <section style={{ marginBottom: "26px" }}>
          <SkillRetentionCosmos3D
            skills={updatedSkills}
            onSelectSkill={(skill) => {
              startPractice(skill);
            }}
          />
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <div><h2>Skill Overview</h2><p>Current estimated retention</p></div>
              <button onClick={() => setActivePage("My Skills")}>View all</button>
            </div>
            <div className="skill-list">
              {loadingSkills ? <p className="empty-text">Loading skills from AWS...</p> : updatedSkills.length === 0 ? <p className="empty-text">No skills added yet.</p> : updatedSkills.map((skill) => (
                <div className="skill-row" key={skill.id}>
                  <div className="skill-avatar">{(skill.name || "?").charAt(0).toUpperCase()}</div>
                  <div className="skill-info"><strong>{skill.name}</strong><span>{skill.category}</span></div>
                  <div className="retention-area">
                    <div className="retention-label"><span>Retention</span><strong>{skill.retention}%</strong></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${skill.retention}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel due-panel">
            <p className="eyebrow">RECOMMENDATION</p>
            <h2>{mostWeakSkill ? `Practice ${mostWeakSkill.name}` : "You're all caught up"}</h2>
            <p>{mostWeakSkill ? `${mostWeakSkill.name} currently has ${mostWeakSkill.retention}% retention. Its priority is ${getPriorityLevel(calculatePriority(mostWeakSkill)).toLowerCase()}.` : "Add some skills to start monitoring retention."}</p>
            {mostWeakSkill && <button className="primary-button full-width" onClick={() => setActivePage("Recommendations")}>View Recommendations</button>}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "22px" }}>
          <div className="panel" style={{ minWidth: 0 }}>
            <div className="panel-header"><div><h2>Skills by Category</h2><p>How your skills are distributed and performing</p></div></div>
            {(() => {
              const categoryMap = {};
              updatedSkills.forEach((skill) => {
                const cat = skill.category || "Uncategorized";
                if (!categoryMap[cat]) categoryMap[cat] = { skills: 0, totalRetention: 0, names: [] };
                categoryMap[cat].skills += 1;
                categoryMap[cat].totalRetention += skill.retention;
                categoryMap[cat].names.push(skill.name);
              });
              const categories = Object.entries(categoryMap)
                .map(([name, data]) => ({ name, skills: data.skills, avgRetention: Math.round(data.totalRetention / data.skills), skillNames: data.names }))
                .sort((a, b) => b.skills - a.skills);
              const catColors = ["#7051e8", "#e47b72", "#3db88a", "#e8a44d", "#5a8dee", "#c467d4"];
              if (categories.length === 0) return <p className="empty-text">Add skills to see category breakdown.</p>;
              return (
                <div style={{ display: "grid", gap: "14px", padding: "8px 0" }}>
                  {categories.map((cat, i) => (
                    <div key={cat.name} style={{ padding: "14px 16px", background: "#faf9ff", borderRadius: "12px", border: "1px solid #efedf5" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: catColors[i % catColors.length], flexShrink: 0 }} />
                          <strong style={{ fontSize: "14px", color: "#302746" }}>{cat.name}</strong>
                        </div>
                        <span style={{ fontSize: "12px", color: "#777287" }}>{cat.skills} skill{cat.skills !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: 1, height: "8px", background: "#efedf5", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.max(0, Math.min(100, cat.avgRetention))}%`, height: "100%", borderRadius: "999px", background: catColors[i % catColors.length], transition: "width 250ms ease" }} />
                        </div>
                        <strong style={{ fontSize: "13px", color: cat.avgRetention < 70 ? "#c2413b" : "#6d4aff", flexShrink: 0 }}>{cat.avgRetention}%</strong>
                      </div>
                      <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#9993a8" }}>{cat.skillNames.join(", ")}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="panel" style={{ minWidth: 0 }}>
            <div className="panel-header"><div><h2>Practice Activity</h2><p>Your recorded sessions over the last 7 days</p></div></div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "10px", minHeight: "190px", padding: "12px 0 0" }}>
              {activityDays.map((day) => {
                const barHeight = day.sessions === 0 ? 4 : Math.max(12, (day.sessions / maxSessions) * 120);
                return (
                  <div key={day.key} title={`${day.dateLabel}: ${day.sessions} session${day.sessions === 1 ? "" : "s"}`} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "176px", gap: "7px" }}>
                    <span style={{ fontSize: "11px", color: "#777287", minHeight: "14px" }}>{day.sessions || ""}</span>
                    <div style={{ width: "min(28px, 78%)", height: `${barHeight}px`, borderRadius: "7px 7px 3px 3px", background: day.sessions ? "linear-gradient(180deg, #9c87ff, #7051e8)" : "#efedf5", transition: "height 250ms ease" }} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#514b64" }}>{day.label}</span>
                    <span style={{ fontSize: "10px", color: "#9993a8" }}>{day.dateLabel}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ margin: "16px 0 0", fontSize: "12px", color: "#777287" }}>Total sessions in this period: <strong style={{ color: "#39334d" }}>{activityDays.reduce((total, day) => total + day.sessions, 0)}</strong></p>
          </div>
        </section>

        <div className="recommendation-card" style={{ marginTop: "22px" }}>
          <div className="recommendation-icon">✦</div>
          <div><p className="eyebrow">RETENTION ENGINE</p><h3>Your retention changes with time.</h3><p>The system considers proficiency, practice history and time since the last practice session.</p></div>
        </div>
      </div>
    );
  }



  /* =========================

     MY SKILLS

  ========================= */







  function renderSkills() {



    return (



      <div className="page-content">



        <div
          className="skill-controls"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <input
            className="search-box"
            type="text"
            placeholder="Search skills..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <button
            className="primary-button"
            onClick={() => setShowAddSkill(true)}
          >
            + Add Skill
          </button>
        </div>







        <div className="all-skills-list">



          {filteredSkills.length === 0 ? (



            <div className="empty-state">



              <div className="placeholder-icon">◌</div>



              <h3>No skills found</h3>



              <p>Try another search or add a new skill.</p>



            </div>



          ) : (



            filteredSkills.map((skill) => (



              <div className="full-skill-card" key={skill.id}>



                <div className="full-skill-left">



                  <div className="large-skill-avatar">



                    {skill.name.charAt(0).toUpperCase()}



                  </div>







                  <div>



                    <h3>{skill.name}</h3>



                    <p>{skill.category}</p>



                  </div>



                </div>







                <div className="full-skill-stat">



                  <span>RETENTION</span>



                  <strong>{skill.retention}%</strong>



                </div>







                <div className="full-skill-stat">



                  <span>PROFICIENCY</span>



                  <strong>{skill.proficiency}</strong>



                </div>







                <div className="full-skill-stat">



                  <span>PRACTICES</span>



                  <strong>{skill.practices}</strong>



                </div>







                <button



                  className="practice-small-button"



                  onClick={() => startPractice(skill)}



                >



                  Practice



                </button>







                <button



                  className="delete-button"



                  onClick={() => deleteSkill(skill.id)}



                >



                  Delete



                </button>



              </div>



            ))



          )}



        </div>



      </div>



    );



  }







  /* =========================



     PRACTICE PAGE



  ========================= */







  function renderPractice() {
    if (practiceStarted && !practiceFinished) {
      if (isGeneratingQuestions) {
        return (
          <div className="page-content">
            <div className="ai-practice-loader">
              <div className="ai-pulse-orb">✦</div>
              <div className="ai-practice-badge">Gemini AI Generating Questions</div>
              <h2 className="ai-practice-title">Generating Practice Session</h2>
              <p className="ai-practice-desc">
                Creating fresh, randomized questions for <strong>{selectedSkill?.name}</strong> at the{" "}
                <strong>{selectedSkill?.proficiency || "Beginner"}</strong> level.
              </p>
              <div className="ai-practice-subtext">Every practice session generates completely new questions for your level.</div>
            </div>
          </div>
        );
      }

      const question = questions[currentQuestion] || questions[0];

      if (!question) {
        return (
          <div className="page-content">
            <div className="ai-practice-loader">
              <h2>Preparing Questions...</h2>
              <button className="primary-button" onClick={resetPractice} style={{ marginTop: "16px" }}>
                Back to Practice
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="page-content">
          <div className="quiz-container">
            <div className="quiz-top">
              <div>
                <p className="eyebrow">PRACTICE SESSION</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0 }}>{selectedSkill?.name}</h1>
                  <span className={`ai-badge-chip ${(selectedSkill?.proficiency || "beginner").toLowerCase()}`}>
                    {selectedSkill?.proficiency || "Beginner"} Level
                  </span>
                </div>
              </div>

              <div className="question-count">
                Question {currentQuestion + 1} / {questions.length}
              </div>
            </div>







            <div className="quiz-progress">



              <div



                style={{



                  width: `${((currentQuestion + 1) / questions.length) * 100



                    }%`,



                }}



              />



            </div>







            <div className="question-card">



              <div className="question-number">



                Question {currentQuestion + 1}



              </div>







              <h2>{question.question}</h2>

              <div className="answer-list">
                {question.options.map((option, index) => {
                  const selectedAnswer = answers[currentQuestion];
                  const hasAnswered =
                    selectedAnswer !== undefined &&
                    selectedAnswer !== null &&
                    selectedAnswer !== "";

                  let optionClass = "answer-option";
                  let optionBadge = String.fromCharCode(65 + index);

                  if (hasAnswered) {
                    if (option === question.answer) {
                      // Correct answer - highlighted Green
                      optionClass += " correct";
                      optionBadge = "✓";
                    } else if (option === selectedAnswer) {
                      // User's chosen wrong answer - highlighted Red
                      optionClass += " wrong";
                      optionBadge = "✗";
                    } else {
                      optionClass += " dimmed";
                    }
                  } else if (selectedAnswer === option) {
                    optionClass += " selected";
                  }

                  return (
                    <button
                      key={option}
                      className={optionClass}
                      onClick={() => selectAnswer(option)}
                      disabled={hasAnswered}
                    >
                      <span>{optionBadge}</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {answers[currentQuestion] !== undefined && (
                <div
                  className={`quiz-feedback-banner ${
                    answers[currentQuestion] === question.answer
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  <div className="feedback-icon">
                    {answers[currentQuestion] === question.answer ? "✓" : "✗"}
                  </div>
                  <div className="feedback-text">
                    <strong>
                      {answers[currentQuestion] === question.answer
                        ? "Correct Answer!"
                        : "Wrong Answer!"}
                    </strong>
                    <span>
                      {answers[currentQuestion] === question.answer
                        ? "Great job, that's correct!"
                        : `The correct option is: ${question.answer}`}
                    </span>
                  </div>
                </div>
              )}







              <button



                className="primary-button quiz-next"



                disabled={!answers[currentQuestion]}



                onClick={nextQuestion}



              >



                {currentQuestion === questions.length - 1



                  ? "Finish Practice"



                  : "Next Question"}



              </button>



            </div>



          </div>



        </div>



      );



    }







    if (practiceFinished) {
      const isNeedsImprovement = practiceScore < 70;
      const totalQuestions = questions.length;
      const correctCount =
        practiceCorrectCount || Math.round((practiceScore / 100) * totalQuestions);

      function extractConcept(q) {
        if (q.concept && typeof q.concept === "string" && q.concept.trim()) {
          return q.concept.trim();
        }
        let txt = (q.question || "").trim();
        txt = txt.replace(
          /^(Which keyword|Which method|Which function|Which symbol|Which collection|Which clause|Which type|Which operator|What is the|What is|What does|Why is a|Why revise a|Why use|How do you|In Python,|In Java,)\s+/i,
          ""
        );
        txt = txt.replace(/[?.:].*$/, "");
        if (txt.length > 42) txt = txt.slice(0, 42) + "...";
        return txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : "Core Concept";
      }

      const masteredConcepts = [];
      const improveConcepts = [];

      questions.forEach((q, idx) => {
        const conceptName = extractConcept(q);
        if (answers[idx] === q.answer) {
          masteredConcepts.push({
            concept: conceptName,
            question: q.question,
            answer: q.answer,
          });
        } else {
          improveConcepts.push({
            concept: conceptName,
            question: q.question,
            userAnswer: answers[idx] || "Unanswered",
            correctAnswer: q.answer,
          });
        }
      });

      let resultIcon = "✓";
      let resultHeading = "Nice work!";
      let badgeLabel = "Nice Performance";
      let badgeType = "nice";
      let message = `You completed the practice session for ${selectedSkill?.name} with ${correctCount} of ${totalQuestions} questions correct.`;

      if (practiceScore >= 90) {
        resultIcon = "🌟";
        resultHeading = "Outstanding Mastery!";
        badgeLabel = "Nice! Excellent Score";
        badgeType = "nice";
        message = `Incredible work! You answered ${correctCount} of ${totalQuestions} questions correctly (${practiceScore}%). Your retention for ${selectedSkill?.name} is in peak condition!`;
      } else if (practiceScore >= 70) {
        resultIcon = "✓";
        resultHeading = "Nice Job!";
        badgeLabel = "Nice Work (Passed)";
        badgeType = "nice";
        message = `Well done! You answered ${correctCount} of ${totalQuestions} questions correctly (${practiceScore}%). You have a solid grasp of ${selectedSkill?.name}.`;
      } else {
        resultIcon = "⚠️";
        resultHeading = "Needs Improvement";
        badgeLabel = "Needs Improvement (< 70%)";
        badgeType = "needs-improvement";
        message = `You answered ${correctCount} of ${totalQuestions} questions correctly (${practiceScore}%). Your score is below the 70% retention threshold needed for strong recall.`;
      }

      return (
        <div className="page-content">
          <div className="practice-result">
            <div className={`result-icon ${badgeType}`}>{resultIcon}</div>

            <div className={`result-badge ${badgeType}`}>{badgeLabel}</div>

            <p className="eyebrow">PRACTICE SUMMARY</p>

            <h1>{resultHeading}</h1>

            <p>{message}</p>

            <div className={`score-circle ${badgeType}`}>
              <strong>{practiceScore}%</strong>
              <span>
                {correctCount} / {totalQuestions} Correct
              </span>
            </div>

            {isNeedsImprovement ? (
              <div className="result-retake-callout">
                <div className="result-retake-callout-icon">↻</div>
                <div className="result-retake-callout-text">
                  <h4>Retake Recommended</h4>
                  <p>
                    Because your score is below 70%, please retake the test to reinforce the concepts you missed. Clicking Retake will generate fresh practice questions tailored to your level.
                  </p>
                </div>
              </div>
            ) : (
              <div className="result-message">
                Your practice result has been saved to the cloud. Keep up the consistent review!
              </div>
            )}

            {/* Concept Mastery Breakdown Analysis Section */}
            <div className="practice-analysis-section">
              <div className="analysis-header">
                <h3>Concept Mastery & Areas for Improvement</h3>
                <p>Analysis of concepts tested during this session for {selectedSkill?.name}</p>
              </div>

              <div className="analysis-grid">
                {/* Mastered Concepts */}
                <div className="analysis-card mastered">
                  <div className="analysis-card-title">
                    <span className="analysis-badge mastered">
                      ✓ Mastered Concepts ({masteredConcepts.length})
                    </span>
                  </div>
                  {masteredConcepts.length > 0 ? (
                    <ul className="concept-list">
                      {masteredConcepts.map((item, idx) => (
                        <li key={idx} className="concept-item mastered">
                          <span className="concept-check">✓</span>
                          <span className="concept-name">{item.concept}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="concept-empty-text">
                      No concepts mastered in this attempt. Retake practice to build mastery!
                    </p>
                  )}
                </div>

                {/* Concepts to Improve */}
                <div className="analysis-card improve">
                  <div className="analysis-card-title">
                    <span className="analysis-badge improve">
                      ⚠️ Concepts to Improve ({improveConcepts.length})
                    </span>
                  </div>
                  {improveConcepts.length > 0 ? (
                    <ul className="concept-list">
                      {improveConcepts.map((item, idx) => (
                        <li key={idx} className="concept-item improve">
                          <span className="concept-cross">✗</span>
                          <div className="concept-details">
                            <span className="concept-name">{item.concept}</span>
                            <small className="concept-correction">
                              Correct answer: {item.correctAnswer}
                            </small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="concept-empty-text">
                      🎉 Outstanding! All concepts in this session were answered correctly.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="result-actions-row">
              {isNeedsImprovement ? (
                <>
                  <button
                    className="primary-button retake-button"
                    onClick={() => startPractice(selectedSkill)}
                  >
                    🔄 Retake Test
                  </button>
                  <button className="secondary-button" onClick={resetPractice}>
                    Back to Practice
                  </button>
                </>
              ) : (
                <>
                  <button className="primary-button" onClick={resetPractice}>
                    Back to Practice
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => startPractice(selectedSkill)}
                  >
                    Practice Again (New Questions)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }







    return (



      <div className="page-content">



        <div className="practice-selection">



          <h2>Choose a skill</h2>







          <p className="section-description">



            Select a skill to begin a short knowledge check.



          </p>







          {updatedSkills.length === 0 ? (



            <div className="empty-state">



              <h3>No skills available</h3>



              <p>Add a skill before starting practice.</p>



            </div>



          ) : (



            <div className="practice-skill-grid">



              {updatedSkills.map((skill) => (



                <div className="practice-skill-card" key={skill.id}>



                  <div className="large-skill-avatar">



                    {skill.name.charAt(0).toUpperCase()}



                  </div>







                  <div className="practice-skill-info">



                    <h3>{skill.name}</h3>



                    <p>{skill.category}</p>







                    <div className="mini-retention">



                      <span>Retention:</span>



                      <strong>{skill.retention}%</strong>



                    </div>



                  </div>







                  <button



                    className="primary-button"



                    onClick={() => startPractice(skill)}



                  >



                    Start



                  </button>



                </div>



              ))}



            </div>



          )}



        </div>



      </div>



    );



  }







  /* =========================



     PRACTICE HISTORY



  ========================= */







  function renderHistory() {



    const averageScore =



      practiceHistory.length > 0



        ? Math.round(



          practiceHistory.reduce(



            (total, entry) => total + entry.score,



            0



          ) / practiceHistory.length



        )



        : 0;







    return (



      <div className="page-content">



        {practiceHistory.length === 0 ? (



          <div className="history-empty">



            <div className="placeholder-icon">◷</div>



            <h2>No practice history yet</h2>



            <p>



              Complete a practice session and your results will



              appear here.



            </p>







            <button



              className="primary-button"



              onClick={() => setActivePage("Practice")}



            >



              Start Practice



            </button>



          </div>



        ) : (



          <div className="history-list">



            <div className="history-summary">



              <div>



                <span>Total Sessions</span>



                <strong>{practiceHistory.length}</strong>



              </div>







              <div>



                <span>Average Score</span>



                <strong>{averageScore}%</strong>



              </div>







              <div>



                <span>Best Score</span>



                <strong>



                  {Math.max(



                    ...practiceHistory.map((entry) => entry.score)



                  )}



                  %



                </strong>



              </div>



            </div>







            {practiceHistory.map((entry) => {



              let status = "weak";



              let statusText = "Needs Improvement";







              if (entry.total > 0) {



                const percentage = (entry.score / entry.total) * 100;







                if (percentage >= 80) {



                  status = "good";



                  statusText = "Strong Performance";



                } else if (percentage >= 60) {



                  status = "average";



                  statusText = "Average Performance";



                }



              }







              return (



                <div className="history-card" key={entry.id}>



                  <div className="history-skill-icon">



                    {entry.skillName.charAt(0).toUpperCase()}



                  </div>







                  <div className="history-main">



                    <h3>{entry.skillName}</h3>



                    <p>{entry.category}</p>



                  </div>







                  <div className="history-score">



                    <span>Score</span>



                    <strong>



                      {entry.total > 0



                        ? Math.round(



                          (entry.score / entry.total) * 100



                        )



                        : 0}



                      %



                    </strong>



                  </div>







                  <div className="history-date">



                    <span>{entry.date}</span>



                    <small>{entry.time}</small>



                  </div>







                  <div className={`history-status ${status}`}>



                    {statusText}



                  </div>



                </div>



              );



            })}



          </div>



        )}



      </div>



    );



  }







  /* =========================



     PERSONALIZED RECOMMENDATIONS



  ========================= */







  function renderRecommendations() {



    const recommendedSkills = [...updatedSkills].sort(



      (a, b) => calculatePriority(b) - calculatePriority(a)



    );







    const topSkill = recommendedSkills[0];







    const topResource = topSkill



      ? getResourceForSkill(topSkill.name)



      : null;







    return (



      <div className="page-content">



        <section className="recommendations-header">



          <p className="eyebrow">SMART RECOMMENDATIONS</p>



          <h1>What should you practice?</h1>



          <p>



            Recommendations consider retention, time since



            practice and skill dependencies.



          </p>



        </section>







        {topSkill ? (



          <>



            <div className="top-recommendation">



              <div className="recommendation-icon">✦</div>







              <div className="top-recommendation-content">



                <p className="eyebrow">TOP PRIORITY</p>



                <h2>Practice {topSkill.name}</h2>







                <p>



                  Priority:{" "}



                  {getPriorityLevel(calculatePriority(topSkill))}.



                  {" "}Current retention is {topSkill.retention}%.



                  {" "}You last practised this skill{" "}



                  {Math.floor(getDaysSincePractice(topSkill))} day(s)



                  ago.



                  {topSkill.dependencies.length > 0 &&



                    " Its dependencies are also considered when calculating priority."}



                </p>







                <button



                  className="primary-button"



                  onClick={() => startPractice(topSkill)}



                >



                  Practice Now



                </button>



              </div>







              <div className="recommendation-retention">



                <strong>{topSkill.retention}%</strong>



                <span>Current Retention</span>



              </div>



            </div>







            {topResource && (



              <section className="recommendation-section">



                <div className="panel-header">



                  <div>



                    <p className="eyebrow">LEARNING RESOURCE</p>



                    <h2>Recommended for {topSkill.name}</h2>



                    <p>



                      Use this resource to strengthen the skill.



                    </p>



                  </div>



                </div>







                <div className="recommendation-card">



                  <div className="recommendation-icon">↗</div>







                  <div>



                    <p className="eyebrow">{topResource.type}</p>



                    <h3>{topResource.title}</h3>



                    <p>{topResource.description}</p>







                    <a



                      href={topResource.url}



                      target="_blank"



                      rel="noopener noreferrer"



                      className="primary-button"



                      style={{



                        display: "inline-block",



                        textDecoration: "none",



                        marginTop: "12px",



                      }}



                    >



                      Open Resource



                    </a>



                  </div>



                </div>



              </section>



            )}







            <section className="recommendation-section">



              <div className="panel-header">



                <div>



                  <h2>Priority List</h2>



                  <p>



                    Skills ranked by estimated revision urgency.



                  </p>



                </div>



              </div>







              <div className="recommendation-list">



                {recommendedSkills.map((skill, index) => {



                  const resource = getResourceForSkill(skill.name);



                  const priority = calculatePriority(skill);



                  const priorityLevel = getPriorityLevel(priority);







                  return (



                    <div



                      className="recommendation-row"



                      key={skill.id}



                    >



                      <div className="recommendation-rank">



                        #{index + 1}



                      </div>







                      <div className="recommendation-skill-info">



                        <strong>{skill.name}</strong>



                        <span>{skill.category}</span>



                      </div>







                      <div className="recommendation-stat">



                        <span>RETENTION</span>



                        <strong>{skill.retention}%</strong>



                      </div>







                      <div className="recommendation-stat">



                        <span>PRIORITY</span>



                        <strong>



                          {priorityLevel} ({priority})



                        </strong>



                      </div>







                      <div className="recommendation-stat">



                        <span>LAST PRACTICED</span>



                        <strong>



                          {skill.lastPracticed



                            ? `${Math.floor(



                              getDaysSincePractice(skill)



                            )} day(s) ago`



                            : "Not recorded"}



                        </strong>



                      </div>







                      {skill.dependencies.length > 0 && (



                        <div className="recommendation-stat">



                          <span>DEPENDENCY</span>



                          <strong>



                            {skill.dependencies



                              .map((dependencyId) => {



                                const dependency = updatedSkills.find(



                                  (item) => item.id === dependencyId



                                );







                                return dependency



                                  ? dependency.name



                                  : "Unknown";



                              })



                              .join(", ")}



                          </strong>



                        </div>



                      )}







                      {resource && (



                        <a



                          href={resource.url}



                          target="_blank"



                          rel="noopener noreferrer"



                          className="practice-small-button"



                          style={{ textDecoration: "none" }}



                        >



                          Resource



                        </a>



                      )}







                      <button



                        className="practice-small-button"



                        onClick={() => startPractice(skill)}



                      >



                        Practice



                      </button>



                    </div>



                  );



                })}



              </div>



            </section>



          </>



        ) : (



          <div className="empty-state">



            <h3>No recommendations</h3>



            <p>Add skills to start receiving recommendations.</p>



          </div>



        )}



      </div>



    );



  }







  /* =========================



     PAGE ROUTER



  ========================= */







  function renderProfile() {
    const detailStyle = {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "18px",
      padding: "16px 0",
      borderBottom: "1px solid #eeeaf5",
    };
    const detailLabelStyle = { color: "#777287" };
    const detailValueStyle = {
      maxWidth: "65%",
      overflowWrap: "anywhere",
      color: "#302746",
      textAlign: "right",
    };

    const averageRetention =
      updatedSkills.length > 0
        ? Math.round(
            updatedSkills.reduce((total, skill) => total + (skill.retention || 0), 0) /
              updatedSkills.length
          )
        : 0;

    const userEmail =
      user?.signInDetails?.loginId ||
      user?.attributes?.email ||
      (user?.username && user.username.includes("@") ? user.username : null);

    return (
      <div className="page-content profile-page" style={{ paddingBottom: "30px" }}>
        <div style={{ maxWidth: "720px", display: "grid", gap: "20px" }}>
          {/* USER HERO & STATS CARD */}
          <div
            className="profile-card"
            style={{
              padding: "26px 28px",
              border: "1px solid #ece7f5",
              borderRadius: "18px",
              background: "#ffffff",
              boxShadow: "0 8px 28px rgba(45, 28, 85, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  width: "76px",
                  height: "76px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, #8b6af0, #6542c2)",
                  color: "#ffffff",
                  fontSize: "34px",
                  fontWeight: 900,
                  boxShadow: "0 8px 22px rgba(101, 66, 194, 0.35)",
                  flexShrink: 0,
                }}
              >
                {(currentUsername || "U").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: "200px" }}>
                <h2
                  style={{
                    margin: "0 0 4px",
                    color: "#1a1238",
                    fontSize: "26px",
                    fontWeight: 900,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {currentUsername}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: "#7047d7",
                      fontWeight: 700,
                      fontSize: "13.5px",
                    }}
                  >
                    @{currentUsername}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 9px",
                      background: "#f0ebff",
                      color: "#6b46c1",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.3px",
                      textTransform: "uppercase",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    Active Learner
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK STATS ROW */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                paddingTop: "18px",
                borderTop: "1px solid #f0ecf7",
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  background: "#faf9fd",
                  borderRadius: "12px",
                  border: "1px solid #ede8f7",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#7e7696",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Tracked Skills
                </span>
                <strong
                  style={{ fontSize: "20px", fontWeight: 900, color: "#22183f" }}
                >
                  {updatedSkills.length}
                </strong>
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  background: "#faf9fd",
                  borderRadius: "12px",
                  border: "1px solid #ede8f7",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#7e7696",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Avg Retention
                </span>
                <strong
                  style={{ fontSize: "20px", fontWeight: 900, color: "#7047d7" }}
                >
                  {averageRetention}%
                </strong>
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  background: "#faf9fd",
                  borderRadius: "12px",
                  border: "1px solid #ede8f7",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#7e7696",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Practice Sessions
                </span>
                <strong
                  style={{ fontSize: "20px", fontWeight: 900, color: "#22183f" }}
                >
                  {practiceHistory.length}
                </strong>
              </div>
            </div>
          </div>

          {/* USERNAME CREATION / EDITING CARD */}
          <div
            style={{
              padding: "24px 28px",
              border: "1px solid #ece7f5",
              borderRadius: "18px",
              background: "#ffffff",
              boxShadow: "0 8px 28px rgba(45, 28, 85, 0.05)",
            }}
          >
            <h3
              style={{
                margin: "0 0 6px",
                color: "#251b42",
                fontWeight: 800,
                fontSize: "16px",
              }}
            >
              Customize Your Username
            </h3>
            <p
              style={{
                margin: "0 0 16px",
                color: "#726989",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Choose the username displayed across your learning dashboard, top bar, and profile.
            </p>

            <form
              onSubmit={handleSaveUsername}
              style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}
            >
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#8a7ba8",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  @
                </span>
                <input
                  id="username-input"
                  type="text"
                  value={editingUsername}
                  onChange={(e) => setEditingUsername(e.target.value)}
                  placeholder="Enter your username"
                  maxLength={30}
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 34px",
                    border: "1px solid #d4c7f0",
                    borderRadius: "10px",
                    background: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#20173d",
                    outline: "none",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
              </div>

              <button
                type="submit"
                className="primary-button"
                style={{ padding: "11px 22px", fontSize: "13px", fontWeight: 800 }}
              >
                Save Username
              </button>
            </form>

            {usernameSavedMsg && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "9px 14px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  color: "#065f46",
                  fontSize: "12.5px",
                  fontWeight: 700,
                }}
              >
                ✓ {usernameSavedMsg}
              </div>
            )}
          </div>

          {/* ACCOUNT DETAILS CARD */}
          <div
            style={{
              padding: "24px 28px",
              border: "1px solid #ece7f5",
              borderRadius: "18px",
              background: "#ffffff",
              boxShadow: "0 8px 28px rgba(45, 28, 85, 0.05)",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: "16px",
                fontWeight: 800,
                color: "#251b42",
              }}
            >
              Account Details
            </h3>

            <div style={detailStyle}>
              <span style={detailLabelStyle}>Display Handle</span>
              <strong style={detailValueStyle}>@{currentUsername}</strong>
            </div>
            {userEmail && (
              <div style={detailStyle}>
                <span style={detailLabelStyle}>Account Email</span>
                <strong style={detailValueStyle}>{userEmail}</strong>
              </div>
            )}
            <div style={detailStyle}>
              <span style={detailLabelStyle}>Account Status</span>
              <strong style={{ ...detailValueStyle, color: "#10b981" }}>
                ● Active & Authenticated
              </strong>
            </div>
            <div style={detailStyle}>
              <span style={detailLabelStyle}>Retention Orbit</span>
              <strong style={detailValueStyle}>
                {updatedSkills.length} skill{updatedSkills.length !== 1 ? "s" : ""} synchronized
              </strong>
            </div>
            <div style={{ ...detailStyle, borderBottom: "none" }}>
              <span style={detailLabelStyle}>Cognito User ID</span>
              <strong
                style={{
                  ...detailValueStyle,
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              >
                {effectiveUserId || "Unavailable"}
              </strong>
            </div>

            <p
              style={{
                margin: "18px 0 0",
                color: "#8a81a0",
                lineHeight: 1.6,
                fontSize: "12.5px",
              }}
            >
              Your retention analytics, practice challenges, and planetary matrix are synchronized to your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderPage() {
    if (activePage === "Dashboard") {
      return renderDashboard();
    }

    if (activePage === "My Skills") {
      return renderSkills();
    }

    if (activePage === "Practice" || activePage === "Practice Skills") {
      return renderPractice();
    }

    if (activePage === "Recommendations") {
      return renderRecommendations();
    }

    if (activePage === "History") {
      return renderHistory();
    }

    if (activePage === "Profile") {
      return renderProfile();
    }

    return renderDashboard();
  }



  /* =========================



     MAIN UI



  ========================= */







  return (



    <div className="app-shell">



      <aside className="sidebar">





        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              activePage === item.name ||
              (item.name === "Practice" && activePage === "Practice Skills");
            return (
              <button
                key={item.name}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActivePage(item.name)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label || item.name}</span>
              </button>
            );
          })}
        </nav>







        <div className="sidebar-bottom">



          <div className="system-status">



            <div className="status-dot" />







            <div>



              <strong>System Active</strong>



              <small>Retention engine running</small>



            </div>



          </div>



        </div>



      </aside>







      <main className="main-content">



        <div className="topbar">
          <div className="topbar-heading">
            <span className="topbar-label">YOUR LEARNING WORKSPACE</span>
            <h2 className="topbar-title" style={{ margin: "6px 0", color: "#26213b", fontSize: "28px", fontWeight: 800 }}>
              {activePage === "History"
                ? "Practice History"
                : activePage === "Practice" || activePage === "Practice Skills"
                ? "Practice Skills"
                : activePage}
            </h2>
            <p style={{ margin: 0, color: "#777287", fontSize: "14px" }}>
              Track your progress and keep your skills sharp.
            </p>
          </div>
        </div>

        {renderPage()}



      </main>







      {showAddSkill && (



        <div



          className="modal-overlay"



          onClick={() => setShowAddSkill(false)}



        >



          <div



            className="modal"



            onClick={(event) => event.stopPropagation()}



          >



            <div className="modal-header">



              <div>



                <p className="eyebrow">SKILL MANAGEMENT</p>



                <h2>Add New Skill</h2>



              </div>







              <button



                className="modal-close"



                onClick={() => setShowAddSkill(false)}



              >



                ×



              </button>



            </div>







            <div className="form-group">



              <label>Skill Name</label>



              <input



                type="text"



                placeholder="e.g. Python"



                value={newSkill.name}



                onChange={(event) =>



                  setNewSkill({



                    ...newSkill,



                    name: event.target.value,



                  })



                }



              />



            </div>







            <div className="form-group">



              <label>Category</label>



              <input



                type="text"



                placeholder="e.g. Programming"



                value={newSkill.category}



                onChange={(event) =>



                  setNewSkill({



                    ...newSkill,



                    category: event.target.value,



                  })



                }



              />



            </div>







            <div className="form-group">



              <label>Proficiency</label>



              <select



                value={newSkill.proficiency}



                onChange={(event) =>



                  setNewSkill({



                    ...newSkill,



                    proficiency: event.target.value,



                  })



                }



              >



                <option value="Beginner">Beginner</option>



                <option value="Intermediate">Intermediate</option>



                <option value="Advanced">Advanced</option>



              </select>



            </div>







            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowAddSkill(false)}
                disabled={isValidatingSkill}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={addSkill}
                disabled={isValidatingSkill}
              >
                {isValidatingSkill ? "Validating with Gemini AI..." : "Add Skill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Notification Popup (for invalid nonsense or success message) */}
      {geminiPopup && (
        <div className="gemini-popup-overlay" onClick={() => setGeminiPopup(null)}>
          <div
            className={`gemini-popup-card ${geminiPopup.type}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gemini-popup-icon-wrap">
              {geminiPopup.type === "error" ? "⚠" : "✓"}
            </div>
            <h3 className="gemini-popup-title">{geminiPopup.title}</h3>
            <p className="gemini-popup-text">{geminiPopup.message}</p>
            <button
              className="gemini-popup-btn"
              onClick={() => setGeminiPopup(null)}
            >
              {geminiPopup.type === "error" ? "Dismiss & Fix Input" : "Continue"}
            </button>
          </div>
        </div>
      )}



    </div>



  );



}







export default App;
