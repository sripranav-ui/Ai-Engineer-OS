// =======================================================
// lessonContent.js
// Custom Lesson Material for AI Engineer OS Roadmap
// =======================================================

const lessonContent = {
  1: {
    duration: "2 Hours",
    skills: ["Syntax", "Printing", "Comments"],
    youtubeId: "kqtD5dpn9C8", // Python for Beginners
    codeExample: `# Day 1: Python Basics
# Printing to the console
print("Hello, AI World!")

# This is a comment. Python ignores it.
# Variables and assignments
message = "Let's build something amazing!"
print(message)
`,
    practiceQuestions: [
      "Write a Python script that prints your favorite quotes and projects.",
      "Add single-line comments explaining each step of your script."
    ],
    quiz: [
      {
        question: "What function is used to output text in Python?",
        options: ["console.log()", "print()", "echo()", "System.out.println()"],
        answerIndex: 1
      },
      {
        question: "Which character is used to start a comment in Python?",
        options: ["//", "#", "/*", "--"],
        answerIndex: 1
      }
    ]
  },
  2: {
    duration: "2 Hours",
    skills: ["Integers", "Floats", "Booleans", "Casting"],
    youtubeId: "kqtD5dpn9C8",
    codeExample: `# Day 2: Variables & Data Types
# Dynamic Typing in Python
age = 25              # Integer (int)
height = 5.9          # Floating point (float)
name = "Pranav"       # String (str)
is_learning = True    # Boolean (bool)

print(type(age))
print(type(height))
print(type(name))
print(type(is_learning))
`,
    practiceQuestions: [
      "Create variables representing a project name, duration, and status. Print their types.",
      "Convert an integer to a float and a float to an integer using casting."
    ],
    quiz: [
      {
        question: "Which of the following is a boolean data type value in Python?",
        options: ["true", "True", "TRUE", "'true'"],
        answerIndex: 1
      },
      {
        question: "How do you find the data type of a variable?",
        options: ["typeof()", "type()", "dataType()", "varType()"],
        answerIndex: 1
      }
    ]
  },
  3: {
    duration: "3 Hours",
    skills: ["Arithmetic", "Modulus", "Logical Operators"],
    youtubeId: "v5MR5JnKcZI", // Python Operators
    codeExample: `# Day 3: Operators
# Arithmetic Operators
a = 15
b = 4
sum_val = a + b
remainder = a % b
power = a ** b

# Logical Operators
is_valid = (a > 10) and (b < 5)

print(f"Remainder: {remainder}, Power: {power}")
print(f"Logical Result: {is_valid}")
`,
    practiceQuestions: [
      "Write a script that calculates the area of a circle (r = 7) using arithmetic operators.",
      "Check if a number is even or odd using the modulus (%) operator."
    ],
    quiz: [
      {
        question: "Which operator is used for exponentiation (power) in Python?",
        options: ["^", "*", "**", "^^"],
        answerIndex: 2
      },
      {
        question: "What does the expression '10 % 3' evaluate to?",
        options: ["3", "1", "0", "3.33"],
        answerIndex: 1
      }
    ]
  },
  4: {
    duration: "3 Hours",
    skills: ["If Else", "Elif", "Equality Operators"],
    youtubeId: "Zp5MuPOgdM0", // Python Conditionals
    codeExample: `# Day 4: Conditional Statements
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
else:
    print("Grade: C")
`,
    practiceQuestions: [
      "Write a script that checks if a user is eligible to unlock a project based on their score.",
      "Determine if a number is positive, negative, or zero."
    ],
    quiz: [
      {
        question: "Which keyword is used for 'else if' in Python?",
        options: ["elseif", "elif", "else if", "if else"],
        answerIndex: 1
      },
      {
        question: "Which operator checks for equality?",
        options: ["=", "==", "===", "isEqual"],
        answerIndex: 1
      }
    ]
  },
  5: {
    duration: "4 Hours",
    skills: ["For Loops", "While Loops", "Break/Continue"],
    youtubeId: "D0a0a509Wk0", // Python Loops
    codeExample: `# Day 5: Loops
# Repeating tasks with For loop
for i in range(3):
    print(f"Iteration: {i}")

# Repeating tasks with While loop
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1
`,
    practiceQuestions: [
      "Write a loop that prints numbers from 10 down to 1 (countdown).",
      "Calculate the sum of all numbers between 1 and 100 using a loop."
    ],
    quiz: [
      {
        question: "What does range(5) produce?",
        options: ["[1, 2, 3, 4, 5]", "[0, 1, 2, 3, 4]", "[0, 1, 2, 3, 4, 5]", "None of the above"],
        answerIndex: 1
      },
      {
        question: "Which keyword can immediately terminate a loop?",
        options: ["stop", "exit", "break", "continue"],
        answerIndex: 2
      }
    ]
  },
  6: {
    duration: "4 Hours",
    skills: ["Arguments", "Return Values", "Code Reuse"],
    youtubeId: "89cGQjB5R4M", // Python Functions
    codeExample: `# Day 6: Functions
# Creating a reusable function
def calculate_progress(completed_days, total_days):
    percentage = (completed_days / total_days) * 100
    return round(percentage, 1)

result = calculate_progress(6, 10)
print(f"Progress: {result}%")
`,
    practiceQuestions: [
      "Create a function that accepts a temperature in Celsius and returns it in Fahrenheit.",
      "Write a function that checks if a string is a palindrome."
    ],
    quiz: [
      {
        question: "Which keyword is used to define a function in Python?",
        options: ["function", "def", "func", "define"],
        answerIndex: 1
      },
      {
        question: "What keyword is used to send a value back to the caller of a function?",
        options: ["send", "back", "return", "output"],
        answerIndex: 2
      }
    ]
  },
  7: {
    duration: "3 Hours",
    skills: ["Mutability", "Indexing", "Slicing"],
    youtubeId: "9OeznAkyQz4", // Python Lists & Tuples
    codeExample: `# Day 7: Lists & Tuples
# Lists (mutable)
fruits = ["apple", "banana"]
fruits.append("cherry")
print(fruits[1]) # banana

# Tuples (immutable)
coordinates = (10.0, 20.0)
# coordinates[0] = 15.0  <-- This would throw an error!
`,
    practiceQuestions: [
      "Create a list of 5 study topics. Remove the last topic and print the remaining list.",
      "Write a function that finds the maximum value in a list of integers."
    ],
    quiz: [
      {
        question: "Which statement is true about tuples?",
        options: [
          "They are mutable.",
          "They are declared using brackets [].",
          "They are immutable.",
          "They cannot store strings."
        ],
        answerIndex: 2
      },
      {
        question: "How do you add an element to the end of a list?",
        options: ["add()", "push()", "append()", "insert()"],
        answerIndex: 2
      }
    ]
  },
  8: {
    duration: "4 Hours",
    skills: ["Key-Value", "Lookup", "Nested Data"],
    youtubeId: "daefaLgNkw0", // Dictionaries
    codeExample: `# Day 8: Dictionaries
student = {
    "name": "Pranav",
    "course": "AI Engineering",
    "days_completed": 8
}

print(student["name"])
student["days_completed"] += 1
print(student.get("score", "No score entered"))
`,
    practiceQuestions: [
      "Create a dictionary representing a book with fields: title, author, and year.",
      "Add a new key 'genre' to the book dictionary and loop through all keys and values."
    ],
    quiz: [
      {
        question: "Which brackets are used to declare a dictionary?",
        options: ["[]", "()", "{}", "<>"],
        answerIndex: 2
      },
      {
        question: "What happens if you query a missing key using .get(key)?",
        options: [
          "Throws a KeyError.",
          "Returns None (or a default value).",
          "Crashes the execution.",
          "Deletes the dictionary."
        ],
        answerIndex: 1
      }
    ]
  },
  9: {
    duration: "3 Hours",
    skills: ["Uniqueness", "Unordered Sets", "Set Methods"],
    youtubeId: "r3R3h50K_0A", // Sets
    codeExample: `# Day 9: Sets
set_a = {1, 2, 3, 3}  # Duplicates are ignored
set_b = {3, 4, 5}

union_set = set_a.union(set_b)          # {1, 2, 3, 4, 5}
intersection_set = set_a.intersection(set_b) # {3}
`,
    practiceQuestions: [
      "Create two sets of unique numbers. Find their symmetric difference.",
      "Verify if a specific number is present in a set using the 'in' keyword."
    ],
    quiz: [
      {
        question: "Does a set allow duplicate values in Python?",
        options: ["Yes", "No", "Only if strings", "Yes, but ordered"],
        answerIndex: 1
      },
      {
        question: "Which set operation returns elements common to both sets?",
        options: ["union()", "difference()", "intersection()", "update()"],
        answerIndex: 2
      }
    ]
  },
  10: {
    duration: "6 Hours",
    skills: ["CLI", "File IO", "Interactive Loop"],
    youtubeId: "D0a0a509Wk0",
    codeExample: `# Day 10: Mini Python Project
# Build an interactive command line dashboard
def run_project():
    print("Welcome to your CLI Study Tracker!")
    print("1. View Current Day")
    print("2. Mark Day Complete")
    # Simulate user input routing logic
    choice = "1"
    if choice == "1":
        print("You are on Day 10.")

run_project()
`,
    practiceQuestions: [
      "Expand the mini CLI project to support adding customized notes inside a local list.",
      "Write a basic text file output log when the CLI project terminates."
    ],
    quiz: [
      {
        question: "What is the primary way to handle user text input in Python?",
        options: ["read()", "input()", "get()", "sys.read()"],
        answerIndex: 1
      },
      {
        question: "Which module in Python is used to exit a program?",
        options: ["exit", "sys", "os", "math"],
        answerIndex: 1
      }
    ]
  }
};

export default lessonContent;
