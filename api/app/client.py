"""
Initialize the OpenAI client for interacting with OpenAI. This module 
cannot be imported until environment variables are set. 
"""

from openai import OpenAI
import os

print(os.environ.get("OPENAI_API_KEY"))
client = OpenAI()
