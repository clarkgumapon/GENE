from setuptools import setup, find_packages

setup(
    name="egadget-backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "flask",
        "flask-cors",
        "pyjwt",
        "bcrypt",
        "python-dotenv"
    ],
) 