#!/usr/bin/env python3
"""
Juego de Adivinanzas con IA — Versión Completa
Modos: Normal, Multijugador, Dificultad, Inverso, Desafío, Temático
"""

import anthropic
import json
import re
import sys
from datetime import datetime
from pathlib import Path

client = anthropic.Anthropic()
SCORES_FILE = Path(__file__).parent / "scores.json"

COLORS = {
    "reset": "\033[0m", "bold": "\033[1m", "dim": "\033[2m",
    "cyan": "\033[96m", "green": "\033[92m", "red": "\033[91m",
    "yellow": "\033[93m", "magenta": "\033[95m", "blue": "\033[94m",
}

def c(color, text):
    return f"{COLORS[color]}{text}{COLORS['reset']}"


# ─── SCOREBOARD ──────────────────────────────────────────────────────────────

def load_scores():
    if not SCORES_FILE.exists():
        return []
    with open(SCORES_FILE) as f:
        return json.load(f).get("scores", [])

def save_score(player, score, rounds, mode):
    scores = load_scores()
    scores.append({
        "player": player, "score": score, "rounds": rounds,
        "mode": mode, "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
    })
    scores.sort(key=lambda x: x["score"], reverse=True)
    with open(SCORES_FILE, "w") as f:
        json.dump({"scores": scores[:20]}, f, ensure_ascii=False, indent=2)

def show_scoreboard():
    scores = load_scores()
    print(f"\n{c('bold', c('yellow', '  ┌─────── TABLA DE RÉCORDS ───────┐'))}")
    if not scores:
        print(f"  │  {c('dim', 'Sin puntuaciones todavía...')}      │")
    else:
        medals = ["🥇", "🥈", "🥉"]
        for i, s in enumerate(scores[:10], 1):
            medal = medals[i - 1] if i <= 3 else f" {i}."
            name = s["player"][:14]
            print(f"  │ {medal} {c('bold', name):<14}  "
                  f"{c('green', str(s['score'])):>4} pts  {c('dim', s['mode'][:8])}")
    print(f"  {c('bold', c('yellow', '  └────────────────────────────────┘'))}\n")


# ─── CLAUDE API ──────────────────────────────────────────────────────────────

def _parse_json(text):
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError("No se pudo parsear JSON")
    return json.loads(match.group())

def setup_round(category):
    print(c("dim", "\n  Claude está pensando en una palabra secreta..."), flush=True)
    r = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        system="Eres el maestro de un juego de adivinanzas. Responde ÚNICAMENTE con JSON válido.",
        messages=[{"role": "user", "content": (
            f"Categoría: {category}\n\n"
            "Elige algo interesante de esta categoría y prepara exactamente 10 pistas "
            "progresivas (de muy vaga a muy específica). Formato JSON exacto:\n"
            '{"secret": "la respuesta", "hints": ["pista 1", ..., "pista 10"]}'
        )}],
    )
    return _parse_json(r.content[0].text)

def setup_challenge(category):
    print(c("dim", "\n  Claude está preparando el desafío..."), flush=True)
    r = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=512,
        system="Eres el maestro de un juego de adivinanzas. Responde ÚNICAMENTE con JSON válido.",
        messages=[{"role": "user", "content": (
            f"Categoría: {category}\n\n"
            "Elige algo y crea UNA SOLA pista críptica, poética y muy difícil. "
            "Usa metáforas, simbolismo, referencias indirectas. Nada obvio.\n"
            '{"secret": "la respuesta", "hint": "pista críptica aquí"}'
        )}],
    )
    return _parse_json(r.content[0].text)

def setup_inverse(category):
    print(c("dim", "\n  Claude está preparando sus preguntas..."), flush=True)
    r = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        system="Eres experto en el juego 20 preguntas. Responde ÚNICAMENTE con JSON válido.",
        messages=[{"role": "user", "content": (
            f"Categoría: {category}\n\n"
            "El jugador piensa en algo de esta categoría. Genera 20 preguntas sí/no "
            "estratégicas para adivinar qué es, de general a específica.\n"
            '{"questions": ["pregunta 1", ..., "pregunta 20"]}'
        )}],
    )
    return _parse_json(r.content[0].text)["questions"]

def claude_guess(category, answers):
    qa = "\n".join(f"P: {q}  R: {a}" for q, a in answers)
    r = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=128,
        messages=[{"role": "user", "content": (
            f"Categoría: {category}\nRespuestas sí/no:\n{qa}\n\n"
            "¿Qué crees que es? Responde solo con el nombre, nada más."
        )}],
    )
    return r.content[0].text.strip()

def show_hint_streaming(num, hint_text):
    print(f"\n  {c('cyan', f'Pista {num}:')} ", end="", flush=True)
    with client.messages.stream(
        model="claude-opus-4-7",
        max_tokens=256,
        messages=[{"role": "user", "content": (
            f"Reformula esta pista de forma más dramática y entretenida, "
            f"conservando la misma información. Solo la pista, sin introducción.\n"
            f"Pista: {hint_text}"
        )}],
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
    print()


# ─── MENÚS ───────────────────────────────────────────────────────────────────

PRESET_CATEGORIES = [
    "Animales salvajes", "Películas famosas", "Países del mundo",
    "Inventos históricos", "Personajes de ficción", "Comidas del mundo",
    "Monumentos famosos", "Deportes", "Superhéroes de Marvel",
    "Canciones de los 80s", "Videojuegos clásicos", "Científicos famosos",
]

def choose_category(fixed=None):
    if fixed:
        return fixed
    print(f"\n{c('bold', '  ¿Qué categoría?')}\n")
    for i, cat in enumerate(PRESET_CATEGORIES, 1):
        print(f"  {c('cyan', f'{i:>2}.')} {cat}")
    print(f"\n  {c('yellow', '   C.')} Categoría personalizada")
    print(f"  {c('dim',    '   Q.')} Volver al menú")
    print(f"\n  {c('bold', 'Tu elección:')} ", end="")
    try:
        choice = input().strip()
    except (EOFError, KeyboardInterrupt):
        return None
    if choice.lower() == 'q':
        return None
    if choice.lower() == 'c':
        print(f"  {c('bold', 'Escribe tu categoría:')} ", end="")
        try:
            custom = input().strip()
            return custom or choose_category()
        except (EOFError, KeyboardInterrupt):
            return None
    if choice.isdigit() and 1 <= int(choice) <= len(PRESET_CATEGORIES):
        return PRESET_CATEGORIES[int(choice) - 1]
    print(c("red", "  Opción no válida."))
    return choose_category()

DIFFICULTIES = {
    "1": ("Fácil",   10),
    "2": ("Normal",   5),
    "3": ("Difícil",  3),
    "4": ("Experto",  1),
}

def choose_difficulty():
    print(f"\n{c('bold', '  Dificultad:')}\n")
    print(f"  {c('green',  '  1.')} Fácil   — 10 intentos")
    print(f"  {c('cyan',   '  2.')} Normal  —  5 intentos")
    print(f"  {c('yellow', '  3.')} Difícil —  3 intentos")
    print(f"  {c('red',    '  4.')} Experto —  1 intento solo")
    print(f"\n  {c('bold', 'Tu elección (Enter = Normal):')} ", end="")
    try:
        choice = input().strip() or "2"
    except (EOFError, KeyboardInterrupt):
        return "Normal", 5
    return DIFFICULTIES.get(choice, ("Normal", 5))

def get_players():
    print(f"\n  {c('bold', '¿Cuántos jugadores? (2-6):')} ", end="")
    try:
        n = max(2, min(6, int(input().strip())))
    except (ValueError, EOFError, KeyboardInterrupt):
        n = 2
    players = []
    for i in range(n):
        print(f"  {c('cyan', f'Nombre del jugador {i+1}:')} ", end="")
        try:
            name = input().strip() or f"Jugador {i+1}"
        except (EOFError, KeyboardInterrupt):
            name = f"Jugador {i+1}"
        players.append(name)
    return players

def ask_name():
    print(f"  {c('cyan', 'Tu nombre (Enter = Anónimo):')} ", end="")
    try:
        return input().strip() or "Anónimo"
    except (EOFError, KeyboardInterrupt):
        return "Anónimo"

def continue_prompt(total):
    print(f"\n  {c('dim', f'Puntuación: {total} pts')}")
    print(f"  {c('cyan', '¿Otra ronda? (Enter = sí | q = salir):')} ", end="")
    try:
        return input().strip().lower() != 'q'
    except (EOFError, KeyboardInterrupt):
        return False

def end_screen(player, score, rounds, mode):
    print(f"""
{c('bold', c('magenta', '  ━━━ JUEGO TERMINADO ━━━'))}
  Jugador : {c('bold', player)}
  Rondas  : {c('yellow', str(rounds))}
  Puntos  : {c('bold', c('green', str(score)))}
""")
    print(f"  {c('cyan', '¿Guardar en el ranking? (s/n):')} ", end="")
    try:
        if input().strip().lower() in ('s', 'si', 'sí', 'y', 'yes', ''):
            save_score(player, score, rounds, mode)
            print(c("green", "  ✓ ¡Guardado en el ranking!"))
    except (EOFError, KeyboardInterrupt):
        pass


# ─── MODOS DE JUEGO ──────────────────────────────────────────────────────────

def play_round(category, round_num, max_guesses, player_name=""):
    tag = f"[{player_name}] " if player_name else ""
    print(f"\n{c('bold', c('magenta', f'  ━━━ {tag}RONDA {round_num} ━━━'))}")
    print(f"  Categoría : {c('yellow', category)}")
    print(f"  Intentos  : {c('bold', str(max_guesses))}\n")

    try:
        data = setup_round(category)
    except Exception as e:
        print(c("red", f"  Error: {e}"))
        return 0

    secret = data["secret"].strip().lower()
    hints = data["hints"]
    step = max(1, len(hints) // max_guesses)

    for attempt in range(1, max_guesses + 1):
        show_hint_streaming(attempt, hints[min((attempt - 1) * step, len(hints) - 1)])
        print(f"\n  {c('bold', f'Intento {attempt}/{max_guesses}:')} ", end="")
        try:
            guess = input().strip().lower()
        except (EOFError, KeyboardInterrupt):
            return -1
        if not guess:
            print(c("dim", "  (sin respuesta)"))
            continue
        if guess == secret or secret in guess or guess in secret:
            score = max_guesses - attempt + 1
            print(f"\n  {c('green', '¡CORRECTO!')} 🎉  Era: {c('bold', data['secret'])}")
            print(f"  Puntos obtenidos: {c('yellow', str(score))}")
            return score
        remaining = max_guesses - attempt
        if remaining > 0:
            print(c("red", f"  ✗ Incorrecto. Te quedan {remaining} intentos."))
        else:
            print(f"\n  {c('red', '¡Sin intentos!')} Era: {c('bold', data['secret'])}")
    return 0

def play_challenge_round(category, round_num):
    print(f"\n{c('bold', c('red', f'  ━━━ ⚡ DESAFÍO {round_num} ━━━'))}")
    print(f"  Categoría : {c('yellow', category)}")
    print(f"  {c('red', 'Una sola pista críptica · 3 intentos · puntos x3')}\n")

    try:
        data = setup_challenge(category)
    except Exception as e:
        print(c("red", f"  Error: {e}"))
        return 0

    secret = data["secret"].strip().lower()
    print(f"  {c('cyan', '🔮 Pista:')} {c('bold', data['hint'])}\n")

    for attempt in range(1, 4):
        print(f"  {c('bold', f'Intento {attempt}/3:')} ", end="")
        try:
            guess = input().strip().lower()
        except (EOFError, KeyboardInterrupt):
            return -1
        if not guess:
            continue
        if guess == secret or secret in guess or guess in secret:
            score = (4 - attempt) * 3
            print(f"\n  {c('green', '¡CORRECTO!')} 🎉  Era: {c('bold', data['secret'])}")
            print(f"  Puntos (×3): {c('yellow', str(score))}")
            return score
        remaining = 3 - attempt
        if remaining > 0:
            print(c("red", f"  ✗ Incorrecto. Te quedan {remaining} intentos."))
        else:
            print(f"\n  {c('red', '¡Sin intentos!')} Era: {c('bold', data['secret'])}")
    return 0

def play_inverse_round(category, round_num):
    print(f"\n{c('bold', c('cyan', f'  ━━━ 🔄 INVERSO {round_num} ━━━'))}")
    print(f"  Categoría : {c('yellow', category)}")
    print(f"\n  Piensa en algo de esta categoría... ¡no me lo digas!")
    print(f"  {c('dim', 'Presiona Enter cuando estés listo.')} ", end="")
    try:
        input()
    except (EOFError, KeyboardInterrupt):
        return -1

    try:
        questions = setup_inverse(category)
    except Exception as e:
        print(c("red", f"  Error: {e}"))
        return 0

    print(f"  Responde {c('green', 'sí')}, {c('red', 'no')} o {c('yellow', 'a veces')} a cada pregunta.\n")
    answers = []

    for i, question in enumerate(questions[:20], 1):
        print(f"  {c('cyan', f'P{i:>2}.')} {question}  ", end="")
        try:
            ans = input().strip().lower()
        except (EOFError, KeyboardInterrupt):
            return -1
        if ans in ('s', 'si', 'sí', 'yes', 'y'):
            ans = "Sí"
        elif ans in ('n', 'no'):
            ans = "No"
        else:
            ans = "A veces"
        answers.append((question, ans))

        # Intento de adivinar cada 5 preguntas
        if i % 5 == 0:
            print(f"\n  {c('bold', '🤔 Creo que es...')} ", end="", flush=True)
            guess = claude_guess(category, answers)
            print(c("bold", guess))
            print(f"  {c('dim', '¿Adiviné? (s/n):')} ", end="")
            try:
                correct = input().strip().lower()
            except (EOFError, KeyboardInterrupt):
                return -1
            if correct in ('s', 'si', 'sí', 'yes', 'y'):
                score = max(1, (20 - i) // 2 + 1)
                print(f"  {c('green', '¡Lo logré!')} 🎉  Con {i} preguntas.")
                return score
            if i < 20:
                print(c("dim", "  Seguiré intentando...\n"))

    print(f"\n  {c('red', 'No pude adivinar.')} ¡Ganaste! +5 puntos")
    return 5


# ─── MENÚ PRINCIPAL ──────────────────────────────────────────────────────────

def main_menu():
    print(f"""
{c('bold', '  ¿Qué modo quieres jugar?')}

  {c('cyan',    '  1.')} Normal        — Clásico, 5 intentos por ronda
  {c('magenta', '  2.')} Multijugador  — Turnos entre varios jugadores
  {c('yellow',  '  3.')} Dificultad    — Elige Fácil / Normal / Difícil / Experto
  {c('green',   '  4.')} Inverso       — Tú piensas, Claude adivina
  {c('red',     '  5.')} Desafío       — Pista críptica, 3 intentos (puntos ×3)
  {c('blue',    '  6.')} Temático      — Una sola categoría toda la sesión
  {c('dim',     '  7.')} Ver ranking
  {c('dim',     '  Q.')} Salir
""")
    print(f"  {c('bold', 'Tu elección:')} ", end="")
    try:
        return input().strip().lower()
    except (EOFError, KeyboardInterrupt):
        return 'q'


def main():
    print(f"""
{c('bold', c('magenta', '  ╔══════════════════════════════════════╗'))}
{c('bold', c('magenta', '  ║     🎯 JUEGO DE ADIVINANZAS IA 🎯    ║'))}
{c('bold', c('magenta', '  ╚══════════════════════════════════════╝'))}
  {c('dim', 'Ctrl+C para salir en cualquier momento.')}
""")

    while True:
        key = main_menu()

        # ── Ranking ──────────────────────────────────────
        if key == '7':
            show_scoreboard()

        # ── Salir ────────────────────────────────────────
        elif key == 'q':
            break

        # ── Normal ───────────────────────────────────────
        elif key == '1':
            player = ask_name()
            total, rounds = 0, 0
            while True:
                cat = choose_category()
                if not cat:
                    break
                rounds += 1
                r = play_round(cat, rounds, 5)
                if r == -1:
                    break
                total += r
                if not continue_prompt(total):
                    break
            end_screen(player, total, rounds, "Normal")

        # ── Multijugador ─────────────────────────────────
        elif key == '2':
            players = get_players()
            scores = {p: 0 for p in players}
            round_num = 0
            running = True
            while running:
                for player in players:
                    cat = choose_category()
                    if not cat:
                        running = False
                        break
                    round_num += 1
                    r = play_round(cat, round_num, 5, player)
                    if r == -1:
                        running = False
                        break
                    scores[player] += r
                    print(f"\n  {c('bold', '── Marcador ──')}")
                    for p, s in sorted(scores.items(), key=lambda x: -x[1]):
                        print(f"    {c('cyan', p):<16} {c('yellow', str(s))} pts")
                    if not continue_prompt(sum(scores.values())):
                        running = False
                        break
            winner = max(scores, key=scores.get)
            print(f"\n  🏆 {c('bold', c('green', f'¡{winner} gana!'))} "
                  f"con {scores[winner]} puntos\n")
            for p, s in scores.items():
                save_score(p, s, round_num, "Multijugador")

        # ── Dificultad ───────────────────────────────────
        elif key == '3':
            player = ask_name()
            diff_name, max_guesses = choose_difficulty()
            total, rounds = 0, 0
            while True:
                cat = choose_category()
                if not cat:
                    break
                rounds += 1
                r = play_round(cat, rounds, max_guesses)
                if r == -1:
                    break
                total += r
                if not continue_prompt(total):
                    break
            end_screen(player, total, rounds, f"Dificultad-{diff_name}")

        # ── Inverso ──────────────────────────────────────
        elif key == '4':
            player = ask_name()
            total, rounds = 0, 0
            while True:
                cat = choose_category()
                if not cat:
                    break
                rounds += 1
                r = play_inverse_round(cat, rounds)
                if r == -1:
                    break
                total += r
                if not continue_prompt(total):
                    break
            end_screen(player, total, rounds, "Inverso")

        # ── Desafío ──────────────────────────────────────
        elif key == '5':
            player = ask_name()
            total, rounds = 0, 0
            while True:
                cat = choose_category()
                if not cat:
                    break
                rounds += 1
                r = play_challenge_round(cat, rounds)
                if r == -1:
                    break
                total += r
                if not continue_prompt(total):
                    break
            end_screen(player, total, rounds, "Desafío")

        # ── Temático ─────────────────────────────────────
        elif key == '6':
            player = ask_name()
            print(f"\n  {c('bold', 'Elige la categoría para TODA la sesión:')}")
            cat = choose_category()
            if not cat:
                continue
            print(f"\n  {c('green', f'Categoría fija: {cat}')}")
            total, rounds = 0, 0
            while True:
                rounds += 1
                r = play_round(cat, rounds, 5)
                if r == -1:
                    break
                total += r
                if not continue_prompt(total):
                    break
            end_screen(player, total, rounds, f"Temático:{cat[:12]}")

    print(f"\n  {c('dim', '¡Hasta pronto!')}\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n  {c('dim', 'Juego interrumpido. ¡Hasta pronto!')}\n")
