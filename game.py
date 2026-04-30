#!/usr/bin/env python3
"""
Juego de Adivinanzas con IA
Claude elige una palabra secreta y da pistas progresivas.
"""

import anthropic
import json
import re
import sys

client = anthropic.Anthropic()

COLORS = {
    "reset": "\033[0m",
    "bold": "\033[1m",
    "cyan": "\033[96m",
    "green": "\033[92m",
    "red": "\033[91m",
    "yellow": "\033[93m",
    "magenta": "\033[95m",
    "dim": "\033[2m",
}

def c(color, text):
    return f"{COLORS[color]}{text}{COLORS['reset']}"


def setup_round(category: str) -> dict:
    """Claude elige la palabra secreta y prepara 10 pistas en secreto."""
    print(c("dim", "  Claude está pensando en una palabra secreta..."), flush=True)

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        system=(
            "Eres el maestro de un juego de adivinanzas. "
            "Tu tarea es elegir una palabra/concepto de la categoría dada y preparar 10 pistas. "
            "Las pistas deben ir de muy vagas (pista 1) a muy específicas (pista 10). "
            "Responde ÚNICAMENTE con JSON válido, sin texto adicional."
        ),
        messages=[{
            "role": "user",
            "content": (
                f"Categoría: {category}\n\n"
                "Elige algo interesante y prepara exactamente 10 pistas progresivas. "
                "Responde con este formato JSON exacto:\n"
                '{"secret": "la respuesta", "hints": ["pista 1", "pista 2", ..., "pista 10"]}'
            ),
        }],
    )

    raw = response.content[0].text.strip()
    # Extraer JSON aunque venga con texto extra
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if not match:
        raise ValueError("No se pudo parsear la respuesta de Claude")
    data = json.loads(match.group())
    return data


def show_hint(hint_number: int, hint_text: str):
    print(f"\n  {c('cyan', f'Pista {hint_number}:')} ", end="", flush=True)
    # Simular streaming letra por letra para efecto dramático
    with client.messages.stream(
        model="claude-opus-4-7",
        max_tokens=256,
        messages=[{
            "role": "user",
            "content": (
                f"Reformula esta pista de forma más dramática y entretenida, "
                f"manteniendo exactamente la misma información. "
                f"Pista original: {hint_text}\n"
                f"Solo responde con la pista reformulada, sin introducción."
            ),
        }],
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
    print()


def play_round(category: str, round_num: int) -> bool:
    """Juega una ronda. Devuelve True si el jugador adivinó."""
    print(f"\n{c('bold', c('magenta', f'━━━ RONDA {round_num} ━━━'))}")
    print(f"  Categoría: {c('yellow', category)}")

    try:
        data = setup_round(category)
    except Exception as e:
        print(c("red", f"  Error al preparar la ronda: {e}"))
        return False

    secret = data["secret"].strip().lower()
    hints = data["hints"]
    max_guesses = 5

    print(f"  Tienes {c('bold', str(max_guesses))} intentos. ¡Buena suerte!\n")

    for attempt in range(1, max_guesses + 1):
        hint_index = (attempt - 1) * 2  # Pistas 1,3,5,7,9 (cada 2 intentos)
        if hint_index < len(hints):
            show_hint(attempt, hints[hint_index])

        print(f"\n  {c('bold', f'Intento {attempt}/{max_guesses}:')} ", end="")
        try:
            guess = input().strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            return False

        if not guess:
            print(c("dim", "  (sin respuesta — intento desperdiciado)"))
            continue

        if guess == secret or secret in guess or guess in secret:
            print(f"\n  {c('green', '¡CORRECTO!')} 🎉  La respuesta era: {c('bold', data['secret'])}")
            score = max_guesses - attempt + 1
            print(f"  Puntos ganados: {c('yellow', str(score))}")
            return score
        else:
            remaining = max_guesses - attempt
            if remaining > 0:
                print(c("red", f"  ✗ Incorrecto. Te quedan {remaining} intentos."))
            else:
                print(f"\n  {c('red', '¡Se acabaron los intentos!')} La respuesta era: {c('bold', data['secret'])}")

    return 0


CATEGORIES = [
    "Animales salvajes",
    "Películas famosas",
    "Países del mundo",
    "Inventos históricos",
    "Personajes de ficción",
    "Comidas del mundo",
    "Monumentos famosos",
    "Deportes",
]


def main():
    print(f"""
{c('bold', c('magenta', '╔══════════════════════════════════════╗'))}
{c('bold', c('magenta', '║     🎯 JUEGO DE ADIVINANZAS IA 🎯    ║'))}
{c('bold', c('magenta', '╚══════════════════════════════════════╝'))}

  Claude elige algo en secreto y te da pistas.
  ¡Adivina con pocos intentos para más puntos!

  {c('dim', 'Presiona Ctrl+C para salir en cualquier momento.')}
""")

    total_score = 0
    round_num = 0

    import random
    random.shuffle(CATEGORIES)

    for category in CATEGORIES:
        round_num += 1
        result = play_round(category, round_num)

        if result is False:  # jugador salió
            break

        total_score += result if result else 0

        print(f"\n  {c('dim', f'Puntuación total: {total_score} puntos')}")

        if round_num < len(CATEGORIES):
            print(f"\n  {c('cyan', '¿Otra ronda? (Enter para continuar, q para salir)')} ", end="")
            try:
                choice = input().strip().lower()
                if choice == 'q':
                    break
            except (EOFError, KeyboardInterrupt):
                break

    print(f"""
{c('bold', c('magenta', '━━━ JUEGO TERMINADO ━━━'))}
  Rondas jugadas: {c('yellow', str(round_num))}
  Puntuación final: {c('bold', c('green', str(total_score)))} puntos

  {c('dim', '¡Gracias por jugar!')}
""")


if __name__ == "__main__":
    if not client.api_key:
        print("Error: Necesitas configurar ANTHROPIC_API_KEY")
        sys.exit(1)
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n  {c('dim', 'Juego interrumpido. ¡Hasta pronto!')}\n")
