
export CUDA_VISIBLE_DEVICES=6,7
ACCELERATE_LOG_LEVEL=info \
    accelerate launch --config_file recipes/accelerate_configs/zero3.yaml \
    src/open_r1/gsm8k.py --config recipes/Qwen2.5-1.5B-Instruct/sagdpo_gsm8k/config.yaml \
    --vllm_mode colocate

