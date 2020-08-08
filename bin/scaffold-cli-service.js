#!/usr/bin/env node

const semver = require('semver');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { PROJECT_PATH } = require('../lib/config/getPathConfig');

// 设置环境变量
function setEnv(env) {
  if (fs.existsSync(env)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: env,
      }),
    );
  }
}

const rawArgv = process.argv.slice(2);
const commands = ['dev', 'build', 'analyzer'];

//  无参数
if (commands.indexOf(rawArgv[0]) < 0) {
  console.log(`${chalk.green('运行')}  ${chalk.yellow('npm run dev')} 开发环境`);
  console.log(`${chalk.green('运行')}  ${chalk.yellow('npm run build')} 项目打包`);
  console.log(`${chalk.green('运行')}  ${chalk.yellow('npm run analyzer')} 包分析`);
  process.exit(1);
}

setEnv(`${PROJECT_PATH}/.env.${rawArgv[1] || rawArgv[0]}`);

const Service = require('../lib/service');
const service = new Service();
service.run(rawArgv[0]).catch(err => {
  console.log(chalk.red(err));
  process.exit(1);
});
