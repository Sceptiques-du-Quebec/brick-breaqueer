import * as Phaser from "phaser";


const LOGO_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMTEzNC4yIDg1Mi45Ij4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIHhsaW5rOmhyZWY9IiNhIiBpZD0iZCIgcGF0dGVyblRyYW5zZm9ybT0ibWF0cml4KDkuMjEzNTc1OSwwLDAsOS4yMTM1NzU5LC0xMDUuMDgxMjYsOTAuNTA2NDQ4KSIvPgogICAgPHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEuNyIgcGF0dGVyblRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMCkgc2NhbGUoMTAsMTApIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPGNpcmNsZSBjeT0iLjUiIHI9Ii41Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjEiIGN5PSIuNSIgcj0iLjUiLz4KICAgICAgPGNpcmNsZSBjeD0iLjUiIGN5PSIxLjQiIHI9Ii41Ii8+CiAgICAgIDxjaXJjbGUgY3g9Ii41IiBjeT0iLS40IiByPSIuNSIvPgogICAgPC9wYXR0ZXJuPgogICAgPHBhdGggaWQ9ImkiIGQ9Ik01NjAuMi0xMDYuOGgzNTYuNVY5LjhINTYwLjJ6Ii8+CiAgICA8cGF0aCBpZD0iZyIgZD0iTTQ3LjYgNTIuNmgxMDk3LjV2NTEwLjlINDcuNnoiLz4KICAgIDxyYWRpYWxHcmFkaWVudCB4bGluazpocmVmPSIjYiIgaWQ9ImUiIGN4PSI0MzgiIGN5PSIxOTcuMiIgcj0iMTQyLjgiIGZ4PSI0MzgiIGZ5PSIxOTcuMiIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgwLjYzMDU1NDY3LDAuNjI4NjkwOTIsLTAuNjUwNTMzMjUsMC42NTI0NjE3MywxODUuNDA1NzksLTY0Ljc1OTYzNSkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIi8+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImIiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZjU0NTQiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZmY2ZjIiBzdG9wLW9wYWNpdHk9IjAiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEuMjI5NjczNikiPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjQ4NC43IiB5PSI0Mi45IiBmaWxsPSIjZmY5ZmNiIiBzdHJva2U9IiNlOTY2NWUiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNDg1LjEiIHk9Ii00NC4zIiBmaWxsPSIjY2Q5ZmZmIiBzdHJva2U9IiM5OTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iOTUxLjIiIHk9IjM5Mi44IiBmaWxsPSIjZmY5ZmNiIiBzdHJva2U9IiNlOTY2NWUiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iOTUxLjEiIHk9IjMwNS45IiBmaWxsPSIjY2Q5ZmZmIiBzdHJva2U9IiM5OTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iOTUxLjQiIHk9IjIxNyIgZmlsbD0iIzlmY2JmZiIgc3Ryb2tlPSIjNjU1MWU3IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9Ijk1MS42IiB5PSIxMjkuNSIgZmlsbD0iI2E0ZmY5OCIgc3Ryb2tlPSIjMmNkOTFlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9Ijk1MiIgeT0iNDMuMiIgZmlsbD0iI2ZjZmY2ZSIgc3Ryb2tlPSIjZDFjMzFkIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjE2LjEiIHk9IjM5My4xIiBmaWxsPSIjZmNmZjZlIiBzdHJva2U9IiNkMWMzMWQiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iMTYuMyIgeT0iMzA1LjciIGZpbGw9IiNmZmFiN2UiIHN0cm9rZT0iI2UxN2MyNSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI5NTEuMyIgeT0iNDc5LjkiIGZpbGw9IiNmZmFiN2UiIHN0cm9rZT0iI2UxN2MyNSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIxNi4zIiB5PSIyMTcuNSIgZmlsbD0iI2ZmOWZjYiIgc3Ryb2tlPSIjZTk2NjVlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjE3IiB5PSIxMjkuNiIgZmlsbD0iI2NkOWZmZiIgc3Ryb2tlPSIjOTk1MWU3IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjE3IiB5PSI0Mi41IiBmaWxsPSIjOWZjYmZmIiBzdHJva2U9IiM2NTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNzE4IiB5PSI0My4xIiBmaWxsPSIjZmZhYjdlIiBzdHJva2U9IiNlMTdjMjUiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iMjUwLjkiIHk9IjQyLjYiIGZpbGw9IiNjZDlmZmYiIHN0cm9rZT0iIzk5NTFlNyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI3MTcuNyIgeT0iMTI5LjUiIGZpbGw9IiNmY2ZmNmUiIHN0cm9rZT0iI2QxYzMxZCIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI0ODQuMiIgeT0iMTI5LjMiIGZpbGw9IiNmZmFiN2UiIHN0cm9rZT0iI2UxN2MyNSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIyNTAuOCIgeT0iMTI5LjUiIGZpbGw9IiNmZjlmY2IiIHN0cm9rZT0iI2U5NjY1ZSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI3MTcuNyIgeT0iMjE3LjYiIGZpbGw9IiNhNGZmOTgiIHN0cm9rZT0iIzJjZDkxZSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI0ODQiIHk9IjIxNy40IiBmaWxsPSIjZmNmZjZlIiBzdHJva2U9IiNkMWMzMWQiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iMjUwLjYiIHk9IjIxNy40IiBmaWxsPSIjZmZhYjdlIiBzdHJva2U9IiNlMTdjMjUiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNzE3LjUiIHk9IjM5Mi42IiBmaWxsPSIjY2Q5ZmZmIiBzdHJva2U9IiM5OTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNzE3LjUiIHk9IjMwNS4zIiBmaWxsPSIjOWZjYmZmIiBzdHJva2U9IiM2NTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNDg0LjMiIHk9IjM5MyIgZmlsbD0iIzlmY2JmZiIgc3Ryb2tlPSIjNjU1MWU3IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjQ4NC4yIiB5PSIzMDUuNCIgZmlsbD0iI2E0ZmY5OCIgc3Ryb2tlPSIjMmNkOTFlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjI1MC40IiB5PSIzMDUuNyIgZmlsbD0iI2ZjZmY2ZSIgc3Ryb2tlPSIjZDFjMzFkIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjI0OS44IiB5PSIzOTMuMyIgZmlsbD0iI2E0ZmY5OCIgc3Ryb2tlPSIjMmNkOTFlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjcxNyIgeT0iNDc5LjciIGZpbGw9IiNmZjlmY2IiIHN0cm9rZT0iI2U5NjY1ZSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI0ODMuMyIgeT0iNDc5LjUiIGZpbGw9IiNjZDlmZmYiIHN0cm9rZT0iIzk5NTFlNyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIyNTAuMSIgeT0iNDc5LjkiIGZpbGw9IiM5ZmNiZmYiIHN0cm9rZT0iIzY1NTFlNyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIxNS42IiB5PSI0ODAuMSIgZmlsbD0iI2E0ZmY5OCIgc3Ryb2tlPSIjMmNkOTFlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjQ4MSIgeT0iNDEuMiIgZmlsbD0iI2ZmOWZjYiIgc3Ryb2tlPSIjZTk2NjVlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjQ4MS40IiB5PSItNDUuOSIgZmlsbD0iI2NkOWZmZiIgc3Ryb2tlPSIjOTk1MWU3IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9Ijk0Ny41IiB5PSIzOTEuMSIgZmlsbD0iI2ZmOWZjYiIgc3Ryb2tlPSIjZTk2NjVlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9Ijk0Ny40IiB5PSIzMDQuMiIgZmlsbD0iI2NkOWZmZiIgc3Ryb2tlPSIjOTk1MWU3IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9Ijk0Ny42IiB5PSIyMTUuMyIgZmlsbD0iIzlmY2JmZiIgc3Ryb2tlPSIjNjU1MWU3IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9Ijk0Ny45IiB5PSIxMjcuOCIgZmlsbD0iI2E0ZmY5OCIgc3Ryb2tlPSIjMmNkOTFlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9Ijk0OC4zIiB5PSI0MS41IiBmaWxsPSIjZmNmZjZlIiBzdHJva2U9IiNkMWMzMWQiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iMTIuNCIgeT0iMzkxLjUiIGZpbGw9IiNmY2ZmNmUiIHN0cm9rZT0iI2QxYzMxZCIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIxMi42IiB5PSIzMDQiIGZpbGw9IiNmZmFiN2UiIHN0cm9rZT0iI2UxN2MyNSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI5NDcuNSIgeT0iNDc4LjIiIGZpbGw9IiNmZmFiN2UiIHN0cm9rZT0iI2UxN2MyNSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIxMi42IiB5PSIyMTUuOCIgZmlsbD0iI2ZmOWZjYiIgc3Ryb2tlPSIjZTk2NjVlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjEzLjIiIHk9IjEyNy45IiBmaWxsPSIjY2Q5ZmZmIiBzdHJva2U9IiM5OTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iMTMuMiIgeT0iNDAuOCIgZmlsbD0iIzlmY2JmZiIgc3Ryb2tlPSIjNjU1MWU3IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjcxNC4yIiB5PSI0MS41IiBmaWxsPSIjZmZhYjdlIiBzdHJva2U9IiNlMTdjMjUiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iMjQ3LjIiIHk9IjQwLjkiIGZpbGw9IiNjZDlmZmYiIHN0cm9rZT0iIzk5NTFlNyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI3MTQiIHk9IjEyNy44IiBmaWxsPSIjZmNmZjZlIiBzdHJva2U9IiNkMWMzMWQiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNDgwLjUiIHk9IjEyNy42IiBmaWxsPSIjZmZhYjdlIiBzdHJva2U9IiNlMTdjMjUiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iMjQ3IiB5PSIxMjcuOCIgZmlsbD0iI2ZmOWZjYiIgc3Ryb2tlPSIjZTk2NjVlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjcxNCIgeT0iMjE1LjkiIGZpbGw9IiNhNGZmOTgiIHN0cm9rZT0iIzJjZDkxZSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI0ODAuMyIgeT0iMjE1LjciIGZpbGw9IiNmY2ZmNmUiIHN0cm9rZT0iI2QxYzMxZCIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIyNDYuOCIgeT0iMjE1LjciIGZpbGw9IiNmZmFiN2UiIHN0cm9rZT0iI2UxN2MyNSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI3MTMuNyIgeT0iMzkxIiBmaWxsPSIjY2Q5ZmZmIiBzdHJva2U9IiM5OTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNzEzLjciIHk9IjMwMy42IiBmaWxsPSIjOWZjYmZmIiBzdHJva2U9IiM2NTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNDgwLjYiIHk9IjM5MS40IiBmaWxsPSIjOWZjYmZmIiBzdHJva2U9IiM2NTUxZTciIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iNDgwLjUiIHk9IjMwMy43IiBmaWxsPSIjYTRmZjk4IiBzdHJva2U9IiMyY2Q5MWUiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS13aWR0aD0iMjYuMyIgb3BhY2l0eT0iLjYiIHBhaW50LW9yZGVyPSJtYXJrZXJzIHN0cm9rZSBmaWxsIiByeT0iMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC45Njk5MzcwNywwLjI0MzM1NTg4LDAsMSwwLDApIi8+CiAgICA8cmVjdCB3aWR0aD0iMjAxLjEiIGhlaWdodD0iNTYuOSIgeD0iMjQ2LjYiIHk9IjMwNCIgZmlsbD0iI2ZjZmY2ZSIgc3Ryb2tlPSIjZDFjMzFkIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjI0Ni4xIiB5PSIzOTEuNiIgZmlsbD0iI2E0ZmY5OCIgc3Ryb2tlPSIjMmNkOTFlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPHJlY3Qgd2lkdGg9IjIwMS4xIiBoZWlnaHQ9IjU2LjkiIHg9IjcxMy4zIiB5PSI0NzgiIGZpbGw9IiNmZjlmY2IiIHN0cm9rZT0iI2U5NjY1ZSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSI0NzkuNSIgeT0iNDc3LjgiIGZpbGw9IiNjZDlmZmYiIHN0cm9rZT0iIzk5NTFlNyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIyNDYuMyIgeT0iNDc4LjIiIGZpbGw9IiM5ZmNiZmYiIHN0cm9rZT0iIzY1NTFlNyIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSIyNi4zIiBvcGFjaXR5PSIuNiIgcGFpbnQtb3JkZXI9Im1hcmtlcnMgc3Ryb2tlIGZpbGwiIHJ5PSIwIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjk2OTkzNzA3LDAuMjQzMzU1ODgsMCwxLDAsMCkiLz4KICAgIDxyZWN0IHdpZHRoPSIyMDEuMSIgaGVpZ2h0PSI1Ni45IiB4PSIxMS45IiB5PSI0NzguNSIgZmlsbD0iI2E0ZmY5OCIgc3Ryb2tlPSIjMmNkOTFlIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI2LjMiIG9wYWNpdHk9Ii42IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCIgcnk9IjAiIHRyYW5zZm9ybT0ibWF0cml4KDAuOTY5OTM3MDcsMC4yNDMzNTU4OCwwLDEsMCwwKSIvPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjI4IiBwYWludC1vcmRlcj0ibWFya2VycyBzdHJva2UgZmlsbCI+CiAgICAgIDxwYXRoIGZpbGw9IiNlOWU5ZmYiIGQ9Im02OTMuNiA3MzUgMjE5LjItMTIwLjggOC4zIDEyMi4yTDY5Ny45IDc5OFoiLz4KICAgICAgPHBhdGggZmlsbD0iIzM1MzU2NCIgZD0ibTYyNSA3MzEgNC42IDY3LjggNjguMy0uOC00LjMtNjN6Ii8+CiAgICAgIDxwYXRoIGZpbGw9IiM0ZDRkOWYiIGQ9Im02MjUgNzMxIDE3OS40LTE0NC4zIDEwOC40IDI3LjVMNjkzLjYgNzM1WiIvPgogICAgICA8cGF0aCBmaWxsPSIjMDIwMjA1IiBkPSJNNjI5LjYgNzk4LjggODE0IDcyOC40bDEwNyA4TDY5OCA3OTh6Ii8+CiAgICAgIDxwYXRoIGZpbGw9IiNkNWQ1ZmYiIGQ9Im04MDQuNCA1ODYuNyA5LjYgMTQxLjcgMTA3IDgtOC4yLTEyMi4yeiIvPgogICAgICA8cGF0aCBmaWxsPSIjNTc1NTlmIiBkPSJtNjI1IDczMSAxNzkuNC0xNDQuMyA5LjYgMTQxLjctMTg0LjQgNzAuNHoiLz4KICAgIDwvZz4KICAgIDxjaXJjbGUgY3g9IjI3Mi45IiBjeT0iNDEyLjEiIHI9IjEzMS42IiBmaWxsPSIjY2QwMDAwIi8+CiAgICA8Y2lyY2xlIGN4PSIyNzIuOSIgY3k9IjQxMi4xIiByPSIxMzEuNiIgZmlsbD0idXJsKCNkKSIgb3BhY2l0eT0iLjQiLz4KICAgIDxjaXJjbGUgY3g9IjI3Mi45IiBjeT0iNDEyLjEiIHI9IjEzMS42IiBmaWxsPSJ1cmwoI2UpIi8+CiAgPC9nPgogIDxnIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSI4LjIiIGZvbnQtc2l6ZT0iMTAwIiBmb250LXdlaWdodD0iNzAwIj4KICAgIDxwYXRoIGQ9Im0xMDUuNCAxMDguNiAxLjctMy45cTguNy4yIDE0LjMgMi43IDUuNyAyLjQgOC41IDYuOCAyLjggNC4zIDIuOCAxMCAwIDYuMS0yLjggMTEtMi44IDQuNi04LjQgNy40LTUuNSAyLjctMTMuOCAyLjdINTIuM2w1LjgtMzguNS01LjgtMzYuNWg1My40cTEwLjQgMCAxNi4yIDUgNS44IDQuNyA1LjggMTMuMyAwIDQuNy0yLjIgOXQtNyA3LjMtMTMgMy43bS0zMi42IDMyLTgtOS44aDM3LjNxNC41IDAgNy0yLjJ0Mi41LTYtMi43LTYuMy04LTIuNEg3MC4xVjk5LjdoMjhxMy42IDAgNi0yIDIuNS0yLjMgMi41LTYgMC0zLTItNC45LTIuMi0yLTYtMkg2NC44bDgtOS43IDUgMzEuN3ptODQuMy0zNy41aDI3LjNxNSAwIDcuOC0yLjN0Mi44LTYuNC0yLjgtNi40LTcuOC0yLjNoLTMwLjJsOS4zLTkuOXY2OS41SDE0M3YtNzVoNDQuNXE4LjYgMCAxNSAzLjEgNi40IDMgMTAgOC40IDMuNiA1LjMgMy42IDEyLjYgMCA3LjEtMy42IDEyLjV0LTEwIDguNC0xNSAzaC0zMC4yem0xMS4yIDcuMWgyMy4zbDI3IDM1LjFoLTI0ek0yMjggNzAuM2gyMC42djc1SDIyOHpNMzQ2IDExNHEtMS4yIDkuOC02LjkgMTcuM3QtMTUgMTEuNVEzMTUgMTQ3IDMwMyAxNDdxLTEzIDAtMjIuOS00Ljl0LTE1LjMtMTMuNy01LjQtMjAuNSA1LjQtMjAuNXE1LjUtOC44IDE1LjMtMTMuN3QyMy00LjlxMTIgMCAyMS4xIDQuMSA5LjMgNC4xIDE1IDExLjZ0Ni44IDE3LjNoLTIwLjhxLTEtNC44LTMuOS04LTIuOS0zLjUtNy42LTUuM1QzMDMgODYuNnEtNyAwLTEyIDIuNi01LjIgMi41LTcuOSA3LjN0LTIuNyAxMS4zIDIuNyAxMS40cTIuNyA0LjcgNy44IDcuM1QzMDMgMTI5cTYuMSAwIDEwLjctMS43IDQuNy0xLjcgNy42LTUgMy0zLjUgNC04LjR6bTEwIDMxLjN2LTc1aDIwLjZ2NTguNWwtNS41LTQuMyA0Mi41LTU0LjJoMjJsLTYwLjkgNzV6bTM1LjgtMzUuOEw0MDcgOTdsMjkuNSA0OC40SDQxM3oiIGFyaWEtbGFiZWw9IkJSSUNLIiBmb250LWZhbWlseT0iVW5ib3VuZGVkIiBzdHlsZT0iLWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjomcXVvdDtVbmJvdW5kZWQgQm9sZCZxdW90Ozt3aGl0ZS1zcGFjZTpwcmU7c2hhcGUtaW5zaWRlOnVybCgjZykiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuNDQ0NDU1MzEpIG1hdHJpeCgwLjk4MDM3MzQ1LDAsMCwyLjAxNjUwNTcsMC4wNTU2NTQwNSwtMTA4LjU0NDgyKSIvPgogICAgPHBhdGggZD0ibTEwNS40IDEwOC42IDEuNy0zLjlxOC43LjIgMTQuMyAyLjcgNS43IDIuNCA4LjUgNi44IDIuOCA0LjMgMi44IDEwIDAgNi4xLTIuOCAxMS0yLjggNC42LTguNCA3LjQtNS41IDIuNy0xMy44IDIuN0g1Mi4zbDUuOC0zOC41LTUuOC0zNi41aDUzLjRxMTAuNCAwIDE2LjIgNSA1LjggNC43IDUuOCAxMy4zIDAgNC43LTIuMiA5dC03IDcuMy0xMyAzLjdtLTMyLjYgMzItOC05LjhoMzcuM3E0LjUgMCA3LTIuMnQyLjUtNi0yLjctNi4zLTgtMi40SDcwLjFWOTkuN2gyOHEzLjYgMCA2LTIgMi41LTIuMyAyLjUtNiAwLTMtMi00LjktMi4yLTItNi0ySDY0LjhsOC05LjcgNSAzMS43em04NC4zLTM3LjVoMjcuM3E1IDAgNy44LTIuM3QyLjgtNi40LTIuOC02LjQtNy44LTIuM2gtMzAuMmw5LjMtOS45djY5LjVIMTQzdi03NWg0NC41cTguNiAwIDE1IDMuMSA2LjQgMyAxMCA4LjQgMy42IDUuMyAzLjYgMTIuNiAwIDcuMS0zLjYgMTIuNXQtMTAgOC40LTE1IDNoLTMwLjJ6bTExLjIgNy4xaDIzLjNsMjcgMzUuMWgtMjR6bTEyMy42LTkuOXYxNWgtNTQuOXYtMTV6bS00MC44IDcuNS00LjkgMzAuMS04LjQtOS40aDU3LjR2MTYuOGgtNjkuN2w1LjctMzcuNS01LjctMzcuNWg2OS4ydjE2LjhIMjM4bDguNC05LjR6bTY5LjMgMjMuMnYtMTYuOGg1MS43VjEzMXptMzkuOS02MC43IDM0LjEgNzVoLTIyLjFsLTI4LjYtNjYuMmg2bC0yOC43IDY2LjJIMjk5bDM0LjEtNzV6IiBhcmlhLWxhYmVsPSJCUkVBIiBmb250LWZhbWlseT0iVW5ib3VuZGVkIiBzdHlsZT0iLWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjomcXVvdDtVbmJvdW5kZWQgQm9sZCZxdW90Ozt3aGl0ZS1zcGFjZTpwcmU7c2hhcGUtaW5zaWRlOnVybCgjaCkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuNDQ0NDU1MzEpIG1hdHJpeCgxLDAsMCwxLjgyOTM0MTUsMzUyLjY0OTIzLDYxLjUwNjQxNikiLz4KICAgIDxwYXRoIGZpbGw9IiM0MjA5NWUiIGQ9Ik01ODUuMi02LjhINTc5Vi0xM2gtNi4zdi02LjNoLTYuMnYtNi4yaC02LjN2LTQzLjhoNi4zdi02LjJoMTguN3Y2LjJoNi4zdjQzLjhoLTYuM1YtMTNoNi4zdjYuMnpNNTc5LTI1LjV2LTQzLjhoLTYuM3Y0My44em0zNy41IDYuMkg2MDR2LTYuMmgtNi4zdi01MGgxMi41djUwaDYuM3YtNTBINjI5djUwaC02LjN2Ni4yem00My43LTYuMmg2LjN2Ni4yaC0zMS4zdi01Ni4yaDMxLjN2Ni4yaC0xOC44djE4LjhoMTguOHY2LjJoLTE4Ljh2MTguOGg2LjN6bTM3LjUgMGg2LjN2Ni4yaC0zMS4zdi01Ni4ySDcwNHY2LjJoLTE4Ljh2MTguOEg3MDR2Ni4yaC0xOC44djE4LjhoNi4zem0zNy41IDYuMkg3Mjl2LTI1aC02LjN2MjVoLTEyLjV2LTU2LjJoMjV2Ni4yaDYuM3YxOC44aC02LjN2Ni4yaDYuM3YyNXpNNzI5LTUwLjV2LTE4LjhoLTYuM3YxOC44eiIgYXJpYS1sYWJlbD0iUVVFRVIiIGZvbnQtZmFtaWx5PSJJdGhhY2EiIHN0eWxlPSItaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOiZxdW90O0l0aGFjYSBCb2xkJnF1b3Q7O3doaXRlLXNwYWNlOnByZTtzaGFwZS1pbnNpZGU6dXJsKCNpKSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC40NDQ0NTUzMSkgbWF0cml4KDEuOTc5MTgyNCwwLDAsMi44NzU0Mzg1LC0zNTYuODE4NzgsMzk5LjQ3NzU1KSIvPgogIDwvZz4KPC9zdmc+";

export default class RainbowBreaker extends Phaser.Scene {

    score = 0;
    level = 0;
    lives = 5;
    paddle = null;
    ball = null;
    bricks = null;
    cursors = null;
    enterKey = null;
    trail = [];
    baseSpeed = 320;
    maxSpeed = 800;
    comboCount = 0;
    lastBrickTime = 0;
    comboThreshold = 450;
    gridConfig = { cols: 8, rows: 4, brickW: 0, brickH: 0, startY: 0 };
    rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    comboWords = [];
    levelOrder = [];
    FLAGS = [];


    static init(settings) {
        const config = {
            type: Phaser.AUTO,
            parent: settings.parent,
            width: settings.width,
            height: settings.height,
            transparent: true,
            antialias: true,
            pixelArt: false,
            roundPixels: false,
            audio: { noAudio: true },
            render: {
                antialias: true,
                pixelArt: false,
                roundPixels: false,
                powerPreference: 'high-performance',
                batchSize: 4096,
                premultipliedAlpha: true
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            physics: {
                default: "arcade",
                arcade: { gravity: { y: 0 } }
            },
            scene: [RainbowBreaker]
        };

        const game = new Phaser.Game(config);
        const cleanFont = (settings.fontFamily || 'Arial').replace(/['"]/g, '');
        const weight = settings.fontWeight || '900';
        const mainColor = settings.color || '#000000';

        game.registry.set('onGameOver', settings.onGameOver);
        game.registry.set('gameFont', cleanFont);
        game.registry.set('gameWeight', weight);
        game.registry.set('gameColor', mainColor);
        game.registry.set('gameFlags', settings.flags)
        game.registry.set('gameWords', settings.words);

        return game;
    }


    preload() {
        this.load.image('game_logo', LOGO_SVG);
        this.FLAGS = this.registry.get('gameFlags') || [];
        this.FLAGS.forEach((flag) => {
            const base64Data = flag.data.split(',')[1];
            const binaryData = atob(base64Data);
            const arrayBuffer = new Uint8Array(binaryData.length);
            for (let j = 0; j < binaryData.length; j++) arrayBuffer[j] = binaryData.charCodeAt(j);
            const blob = new Blob([arrayBuffer], { type: 'image/svg+xml' });
            const blobUrl = URL.createObjectURL(blob);
            this.load.image(flag.id, blobUrl);
        });
    }


    create() {
        const { width, height } = this.sys.game.config;
        this.comboWords = this.registry.get('gameWords') || ["BRAVO"];

        this.pauseText = null;
        this.pauseSubText = null;
        this.gridConfig.brickW = Math.floor((width * 0.9) / this.gridConfig.cols);
        this.gridConfig.brickH = Math.floor(height * 0.08);
        this.gridConfig.startY = Math.floor(height * 0.15);
        this.gridConfig.totalWidth = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.totalHeight = this.gridConfig.rows * this.gridConfig.brickH;

        this.onGameOverCallback = this.registry.get('onGameOver');
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const paddleWidth = Math.max(100, width * 0.15);
        g.fillStyle(0xffffff).fillRect(0, 0, paddleWidth, 20).generateTexture("paddle", paddleWidth, 20);
        g.clear();

        for (let r = 9; r > 0; r--) {
            const color = this.rainbowColors[r % this.rainbowColors.length];
            g.fillStyle(color).fillCircle(9, 9, r);
        }
        g.generateTexture("ball", 18, 18);
        g.clear();

        g.fillStyle(0xbdc3c7, 0.85);
        g.fillRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH);
        g.fillStyle(0xffffff, 0.3);
        g.fillRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH / 2);
        g.lineStyle(2, 0xffffff, 0.6);
        g.strokeRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH);
        g.generateTexture("brick_cover", this.gridConfig.brickW, this.gridConfig.brickH);
        g.clear();
        g.fillStyle(0xffffff).fillRect(0, 0, 5, 5).generateTexture("part", 5, 5);
        g.destroy();

        this.physics.world.setBounds(0, 60, width, height - 60);
        this.physics.world.checkCollision.down = false;

        this.bgFlag = this.add.image(0, 0, "").setOrigin(0, 0).setDepth(0).setAlpha(0);

        this.trailG = this.add.graphics().setDepth(1);
        this.uiGroup = this.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.input.mouse.preventDefaultWheel = false;
        this.input.mouse.capture = false;

        const baseSize = Math.max(14, Math.round(width / 40));
        const textStyle = { font: `${fontWeight} ${baseSize}px "${fontName}"`, fill: mainColor };

        this.scoreText = this.add.text(width * 0.05, height * 0.04, "Score: 0", textStyle).setResolution(2).setDepth(10).setVisible(false);
        this.levelText = this.add.text(width / 2, height * 0.04, "Niveau: 1", textStyle).setResolution(2).setOrigin(0.5, 0).setDepth(10).setVisible(false);
        this.livesText = this.add.text(width * 0.95, height * 0.04, "Vies: 3", textStyle).setResolution(2).setOrigin(1, 0).setDepth(10).setVisible(false);

        this.historyText = this.add.text(width / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", {
            font: `600 ${Math.max(12, baseSize * 0.8)}px "${fontName}"`, fill: mainColor,
            align: "center", wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5, 0).setResolution(2).setDepth(10).setVisible(false);

        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 100, max: 400 }, angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 }, lifespan: 800, gravityY: 300, emitting: false
        }).setDepth(5);

        this.createLogoTexture('game_logo', LOGO_SVG);
        this.showStartScreen();
        this.input.on('pointerup', () => {
            this.handleGlobalAction(false);
        }, this);
    }


    addFloatingEffect(target) {
        this.tweens.add({ targets: target, y: target.y - 5, duration: 800, ease: 'Sine.easeInOut', yoyo: true, loop: -1 });
    }


    cleanupGame() {
        if (this.bricks) { this.bricks.clear(true, true); this.bricks.destroy(); this.bricks = null; }
        if (this.paddle) this.paddle.destroy();
        if (this.ball) this.ball.destroy();
        this.trail = [];
        this.trailG.clear();
        this.uiGroup.clear(true, true);
    }


    showStartScreen() {
        this.cleanupGame();
        const { width, height } = this.sys.game.config;
        this.gameState = "START";

        if (this.bgFlag) this.bgFlag.setAlpha(0);

        const fontName = this.registry.get('gameFont');
        const mainColor = this.registry.get('gameColor');

        const displayLogoHD = () => {
            const sourceImg = this.textures.get('game_logo').getSourceImage();

            if (!sourceImg || sourceImg.width === 0) {
                this.time.delayedCall(50, displayLogoHD);
                return;
            }

            const hdWidth = 2000;
            const ratio = sourceImg.height / sourceImg.width;
            const hdHeight = hdWidth * ratio;

            if (!this.textures.exists('logo_hd')) {
                const canvasTexture = this.textures.createCanvas('logo_hd', hdWidth, hdHeight);
                canvasTexture.context.drawImage(sourceImg, 0, 0, hdWidth, hdHeight);
                canvasTexture.refresh();
            }

            const logo = this.add.image(width / 2, height * 0.45, 'logo_hd');
            const displayWidth = width * 0.6;
            logo.setScale(displayWidth / hdWidth);
            this.uiGroup.add(logo);
            this.createStartText(logo.y + (logo.displayHeight / 2) + 50);
        };

        if (this.textures.exists('game_logo')) {
            displayLogoHD();
        } else {
            this.createStartText(height * 0.5);
        }

        if (this.livesGroup) this.livesGroup.clear(true, true);

        const uiElements = [
            this.scoreText,
            this.levelText,
            this.comboText,
            this.statsText,
            this.livesText,
            this.highScoreText
        ];

        uiElements.forEach(element => {
            if (element) element.setVisible(false);
        });
    }


    createStartText(yPos) {
        const { width } = this.sys.game.config;
        const fontName = this.registry.get('gameFont');
        const mainColor = this.registry.get('gameColor');
        const fontWeight = this.registry.get('gameWeight') || '900';

        const sub = this.add.text(width / 2, yPos, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR COMMENCER", {
            font: `${fontWeight} ${Math.round(width / 45)}px "${fontName}"`,
            fill: mainColor
        }).setOrigin(0.5);

        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }


    async createLogoTexture(key, svgData) {
        const { width } = this.sys.game.config;
        const targetWidth = width * 0.6;

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.height / img.width;
                const targetHeight = targetWidth * ratio;
                if (this.textures.exists(key)) this.textures.remove(key);
                const tex = this.textures.createCanvas(key, targetWidth, targetHeight);
                tex.context.drawImage(img, 0, 0, targetWidth, targetHeight);
                tex.update();
                resolve();
            };
            img.src = svgData;
        });
    }


    startGame() {
        this.cleanupGame();
        this.gameState = "PLAYING";
        this.scoreText.setVisible(true);
        this.levelText.setVisible(true);
        this.livesText.setVisible(true);
        this.score = 0; this.level = 0; this.lives = 5;

        // Génération de l'ordre : index 0 puis le reste mélangé
        const totalFlags = this.FLAGS.length;
        let others = Array.from({ length: totalFlags - 1 }, (_, i) => i + 1);
        for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
        }
        this.levelOrder = [0, ...others];

        this.bricks = this.physics.add.staticGroup();
        this.createGameObjects();
        this.loadLevel(this.level);
    }


    createGameObjects() {
        const { width, height } = this.sys.game.config;
        const mainColor = this.registry.get('gameColor');
        const phaserColor = Phaser.Display.Color.HexStringToColor(mainColor).color;

        this.paddle = this.physics.add.image(width / 2, height - 40, "paddle").setImmovable(true).setTint(phaserColor);
        this.paddle.setCollideWorldBounds(true);
        this.ball = this.physics.add.image(width / 2, height - 150, "ball").setCircle(9).setBounce(1, 1).setCollideWorldBounds(true).setDepth(100);
        this.physics.add.collider(this.ball, this.paddle, (b, p) => {
            let diff = b.x - p.x;
            b.setVelocityX(10 * diff);
        });
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    }


    async loadLevel(i) {
        const { width } = this.sys.game.config;
        this.gameState = "PLAYING";
        this.historyText.setVisible(false);
        this.uiGroup.clear(true, true);
        if (this.bricks) this.bricks.clear(true, true);

        const flagIndex = this.levelOrder[i % this.levelOrder.length];
        const currentFlag = this.FLAGS[flagIndex];
        const textureKey = "flag_sharp_" + flagIndex;
        const targetW = this.gridConfig.cols * this.gridConfig.brickW;
        const targetH = this.gridConfig.rows * this.gridConfig.brickH;

        if (!this.textures.exists(textureKey)) await this.createFlagTexture(textureKey, currentFlag.data, targetW, targetH);

        this.bgFlag.setTexture(textureKey);
        this.bgFlag.setDisplaySize(targetW, targetH);

        const startX = Math.floor((width - targetW) / 2);
        this.bgFlag.setPosition(startX, this.gridConfig.startY);
        this.bgFlag.setOrigin(0, 0);
        this.bgFlag.setAlpha(1);

        for (let r = 0; r < this.gridConfig.rows; r++) {
            for (let c = 0; c < this.gridConfig.cols; c++) {
                const bx = startX + (c * this.gridConfig.brickW) + (this.gridConfig.brickW / 2);
                const by = this.gridConfig.startY + (r * this.gridConfig.brickH) + (this.gridConfig.brickH / 2);
                const b = this.bricks.create(bx, by, "brick_cover");
                b.refreshBody();
            }
        }
        this.ball.setVisible(true).setAlpha(1);
        this.paddle.setVisible(true).setAlpha(1);
        this.resetBall();
    }


    async createFlagTexture(key, svgData, targetW, targetH) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                if (this.textures.exists(key)) this.textures.remove(key);
                const tex = this.textures.createCanvas(key, targetW, targetH);
                tex.context.drawImage(img, 0, 0, targetW, targetH);
                tex.update();
                resolve();
            };
            img.src = svgData;
        });
    }


    hitBrick(ball, brick) {
        const currentTime = this.time.now;
        if (currentTime - this.lastBrickTime < this.comboThreshold) {
            this.comboCount++;
            const comboBonus = 100 + ((this.comboCount - 1) * 50);
            this.score += comboBonus;
            this.spawnComboWord(brick.x, brick.y, comboBonus);
        } else {
            this.comboCount = 0;
            this.score += 25;
            this.spawnComboWord(brick.x, brick.y, 25);
        }
        this.lastBrickTime = currentTime;
        for (let i = 0; i < 20; i++) {
            const color = (Math.random() > 0.5) ? 0xffffff : Phaser.Utils.Array.GetRandom(this.rainbowColors);
            this.particles.setParticleTint(color);
            this.particles.emitParticleAt(brick.x, brick.y, 1);
        }
        brick.destroy();
        if (this.bricks.countActive() === 0) this.revealFlag();
    }


    spawnComboWord(x, y, bonus) {
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');
        const word = Phaser.Utils.Array.GetRandom(this.comboWords);
        const txt = this.add.text(x, y, `${word}\n+${bonus}`, {
            font: `${fontWeight} 22px "${fontName}"`, fill: mainColor,
            stroke: "#FFF", strokeThickness: 4, align: "center"
        }).setOrigin(0.5).setDepth(20).setResolution(2);
        this.tweens.add({ targets: txt, y: y - 100, alpha: 0, scale: 1.3, duration: 2200, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
    }


    revealFlag() {
        const { width, height } = this.sys.game.config;
        this.gameState = "REVEAL";
        this.ball.setVelocity(0, 0).setVisible(false);
        this.paddle.setVisible(false);
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');
        const flagIndex = this.levelOrder[this.level % this.levelOrder.length];
        const currentFlag = this.FLAGS[flagIndex];
        this.historyText.setText(`${currentFlag.name.toUpperCase()}\n\n${currentFlag.history}`).setVisible(true);
        const sub = this.add.text(width / 2, height - 80, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR CONTINUER", { font: `${fontWeight} 14px "${fontName}"`, fill: mainColor }).setOrigin(0.5).setResolution(2);
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }


    resetBall() {
        const { width, height } = this.sys.game.config;
        this.comboCount = 0;
        this.trail = [];
        this.trailG.clear();
        this.ball.setVelocity(0, 0)
                .setPosition(width / 2, height - 150)
                .setVisible(false);
        this.startCountdown();
    }

    
    startCountdown() {
        const { width, height } = this.sys.game.config;
        const fontName = this.registry.get('gameFont');
        const mainColor = this.registry.get('gameColor');
        const fontWeight = this.registry.get('gameWeight');

        this.ball.setVisible(false);
        const bottomOfBricks = this.gridConfig.startY + (this.gridConfig.rows * this.gridConfig.brickH);
        const centerY = bottomOfBricks + (this.paddle.y - bottomOfBricks) / 2;
        const countdownValues = ['3', '2', '1'];
        let index = 0;

        const countdownText = this.add.text(width / 2, centerY, '', {
            font: `${fontWeight} ${Math.round(width / 10)}px "${fontName}"`,
            fill: mainColor
        }).setOrigin(0.5).setDepth(100).setResolution(2);

        const timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (index < countdownValues.length) {
                    countdownText.setText(countdownValues[index]);
                    countdownText.setScale(0.5);
                    this.tweens.add({
                        targets: countdownText,
                        scale: 1,
                        duration: 150,
                        ease: 'Back.easeOut'
                    });
                    index++;
                } else {
                    countdownText.destroy();
                    this.launchBall(); 
                }
            },
            repeat: countdownValues.length
        });
    }


    launchBall() {
        if (this.gameState !== "PLAYING" || !this.ball.active) return;
        this.ball.setVisible(true).setAlpha(1);
        const speed = Math.min(this.baseSpeed + (this.level * 20), this.maxSpeed);
        this.ball.setVelocity(Phaser.Math.Between(-80, 80), -speed);
    }


    setPause(isPaused) {
        const { width, height } = this.sys.game.config;
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        if (isPaused) {
            this.gameState = "PAUSED";
            this.physics.world.pause();
            if (this.launchTimer) this.launchTimer.paused = true;

            this.pauseText = this.add.text(width / 2, height * 0.65, "PAUSE", {
                font: `${fontWeight} ${Math.round(width / 15)}px "${fontName}"`, fill: mainColor
            }).setOrigin(0.5).setResolution(2).setDepth(100);
            this.pauseSubText = this.add.text(width / 2, this.pauseText.y + (height * 0.1), "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR CONTINUER", {
                font: `${fontWeight} ${Math.round(width / 45)}px "${fontName}"`, fill: mainColor
            }).setOrigin(0.5).setResolution(2).setDepth(100);

            this.addFloatingEffect(this.pauseSubText);
        } else {
            this.gameState = "PLAYING";
            this.physics.world.resume();
            if (this.launchTimer) {
                this.launchTimer.paused = false;
            } else if (this.ball.body.velocity.x === 0 && this.ball.body.velocity.y === 0) {
                this.resetBall();
            }
            if (this.pauseText) this.pauseText.destroy();
            if (this.pauseSubText) this.pauseSubText.destroy();
        }
    }


    async gameOver() {
        const { width, height } = this.sys.game.config;
        this.gameState = "WAITING_FOR_CALLBACK";
        if (this.ball) this.ball.setVelocity(0, 0);
        this.historyText.setVisible(false);
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const titleText = "FIN DE LA PARTIE";
        const title = this.add.text(width / 2, height * 0.65, titleText, { font: `${fontWeight} ${Math.round(width / 18)}px "${fontName}"`, fill: mainColor }).setOrigin(0.5).setResolution(2);
        this.uiGroup.add(title);

        if (this.lives < 0) this.livesText.setText(`Vies: 0`);
        if (this.livesText) {
            this.livesText.setText(`Vies : 0`);
            this.livesText.setVisible(true);
        }
        if (this.livesGroup) {
            this.livesGroup.clear(true, true);
        }

        if (this.onGameOverCallback) await this.onGameOverCallback({ score: this.score, levelReached: this.level + 1 });
        this.gameState = "GAMEOVER";
        const sub = this.add.text(width / 2, title.y + 50, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR RÉESSAYER", { font: `${fontWeight} ${Math.round(width / 40)}px "${fontName}"`, fill: mainColor }).setOrigin(0.5).setResolution(2);
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }


    handleGlobalAction(isKeyboard = false) {
        if (this.gameState === "WAITING_FOR_CALLBACK") return;
        switch (this.gameState) {
            case "START":
                this.startGame();
                break;
            case "GAMEOVER":
                this.showStartScreen();
                break;
            case "REVEAL":
                this.level++;
                this.loadLevel(this.level);
                break;
            case "PLAYING":
                if (isKeyboard) this.setPause(true);
                break;
            case "PAUSED":
                this.setPause(false);
                break;
        }
    }


    update() {
        const { width, height } = this.sys.game.config;
        const pointer = this.input.activePointer;

        if (this.gameState === "WAITING_FOR_CALLBACK") return;
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.handleGlobalAction(true);
        }

        if (this.gameState === "PLAYING") {
            this.scoreText.setText(`Score: ${this.score}`);
            this.levelText.setText(`Niveau: ${this.level + 1}`);
            this.livesText.setText(`Vies: ${this.lives}`);

            const moved = Math.abs(pointer.x - this.lastMouseX) > 1;
            this.lastMouseX = pointer.x;
            if (this.cursors.left.isDown || this.cursors.right.isDown) this.lastInputMethod = "keyboard";
            else if (moved) this.lastInputMethod = "mouse";

            if (this.lastInputMethod === "keyboard") {
                if (this.cursors.left.isDown) this.paddle.setVelocityX(-750);
                else if (this.cursors.right.isDown) this.paddle.setVelocityX(750);
                else this.paddle.setVelocityX(0);
            } else {
                this.paddle.setVelocityX((pointer.x - this.paddle.x) * 15);
            }

            if (this.ball && this.ball.y > height + 20) {
                this.ball.y = -100; this.lives--;
                if (this.lives <= 0) this.gameOver();
                else this.resetBall();
            }

            if (this.ball && this.ball.active && this.ball.visible && (this.ball.body.velocity.x !== 0 || this.ball.body.velocity.y !== 0)) {
                this.trail.push({ x: this.ball.x, y: this.ball.y });
                if (this.trail.length > 12) this.trail.shift();
                this.drawTrail();
            } else this.trailG.clear();
        }
    }


    drawTrail() {
        this.trailG.clear();
        this.trail.forEach((p, i) => {
            const ratio = i / this.trail.length;
            this.trailG.fillStyle(this.rainbowColors[i % this.rainbowColors.length], ratio * 0.4);
            this.trailG.fillCircle(p.x, p.y, 4 + (ratio * 5));
        });
    }
}