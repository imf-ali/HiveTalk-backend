# HiveTalk Backend

Welcome to the backend repository for HiveTalk! This repository contains the server-side code and GraphQL APIs for our application.

Link to the GraphQL APIs playground - https://hivetalkapi.onrender.com/graphql

Link to the front-end repository - https://github.com/imf-ali/HiveTalk-web

## Getting Started

These instructions will help you get the backend server up and running on your local machine.

### Prerequisites

- Node.js (v16 or higher)
- PostgresQL (or your preferred database)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/imf-ali/HiveTalk-backend.git

2. Copy the .env-example file to .env file. JWT_SECRET can be any random string

    ```bash
    cp .env-example .env
3. Install the packages 

    ```bash
    yarn
4. Build the project 

    ```bash
    yarn build
5. Apply the migrations to the database schema

    ```bash
    yarn create:migration
6. Run the project

    ```bash
    yarn start
