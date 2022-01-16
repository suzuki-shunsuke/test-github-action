"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = require('js-yaml');
const targetPrefix = 'target:';
const tfmigratePrefix = 'migrate:';
const ignorePrefix = 'ignore:';
const configFilePattern = '**/ci.yaml';
const changedFilesFile = 'pr_all_filenames.txt';
try {
    const config = yaml.load(fs.readFileSync(core.getInput('config'), 'utf8'));
    const configWorkingDirMap = new Map();
    const configTargetMap = new Map();
    for (let i = 0; i < config.targets.length; i++) {
        const target = config.targets[i];
        configWorkingDirMap.set(target.working_directory, target);
        configTargetMap.set(target.target, target);
    }
    const labels = fs.readFileSync(core.getInput('labels'), 'utf8').split('\n');
    const changedFiles = fs.readFileSync(core.getInput('changed_files'), 'utf8').split('\n');
    const configFiles = fs.readFileSync(core.getInput('config_files'), 'utf8').split('\n');
    const workingDirs = new Set();
    for (let i = 0; i < configFiles.length; i++) {
        const configFile = configFiles[i];
        if (configFile == '') {
            continue;
        }
        workingDirs.add(path.dirname(configFile));
    }
    const terraformTargets = [];
    const tfmigrateTargets = [];
    const targets = new Set();
    const tfmigrates = new Set();
    const ignores = new Set();
    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        if (label == '') {
            continue;
        }
        if (label.startsWith(config.label_prefixes.target)) {
            const target = label.slice(config.label_prefixes.target.length);
            targets.add(target);
            for (let i = 0; i < config.targets.length; i++) {
                const targetConfig = config.targets[i];
                if (target.startsWith(targetConfig.target)) {
                    terraformTargets.push({
                        target: target,
                        working_directory: target.replace(targetConfig.target, targetConfig.working_directory),
                        config: targetConfig,
                    });
                    break;
                }
            }
            continue;
        }
        if (label.startsWith(config.label_prefixes.tfmigrate)) {
            const target = label.slice(config.label_prefixes.tfmigrate.length);
            tfmigrates.add(target);
            for (let i = 0; i < config.targets.length; i++) {
                const targetConfig = config.targets[i];
                if (target.startsWith(targetConfig.target)) {
                    tfmigrateTargets.push({
                        target: target,
                        working_directory: target.replace(targetConfig.target, targetConfig.working_directory),
                        config: targetConfig,
                    });
                    break;
                }
            }
            continue;
        }
        if (label.startsWith(config.label_prefixes.ignore)) {
            ignores.add(label.slice(config.label_prefixes.ignore.length));
            continue;
        }
    }
    const changedWorkingDirs = new Set();
    for (let i = 0; i < changedFiles.length; i++) {
        const changedFile = changedFiles[i];
        if (changedFile == '') {
            continue;
        }
        for (let workingDir of workingDirs) {
            if (changedFile.startsWith(workingDir + '/')) {
                changedWorkingDirs.add(workingDir);
            }
        }
    }
    for (let changedWorkingDir of changedWorkingDirs) {
        for (let i = 0; i < config.targets.length; i++) {
            const target = config.targets[i];
            if (changedWorkingDir.startsWith(target.working_directory)) {
                const changedTarget = changedWorkingDir.replace(target.working_directory, target.target);
                if (!targets.has(changedTarget) && !ignores.has(changedTarget) && !tfmigrates.has(changedTarget)) {
                    terraformTargets.push({
                        target: changedTarget,
                        working_directory: changedWorkingDir,
                        config: target,
                    });
                }
                break;
            }
        }
    }
    core.setOutput('tfmigrate_targets', tfmigrateTargets);
    core.setOutput('terraform_targets', terraformTargets);
}
catch (error) {
    core.setFailed(error instanceof Error ? error.message : JSON.stringify(error));
}
